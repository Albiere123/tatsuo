const fs = require('fs').promises;
const path = require('path');

class CustomDB {
    constructor(dbPath = './data/') {
        this.dbPath = dbPath;

        // Cria a pasta de dados se não existir
        fs.mkdir(this.dbPath, { recursive: true }).catch(console.error);
    }

    _getFilePath(key) {
        return path.join(this.dbPath, `${key}.json`);
    }

    async get(key) {
        const filePath = this._getFilePath(key);
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Erro ao ler a chave "${key}":`, error);
            return undefined; // Retorna undefined se não encontrar ou se houver erro
        }
    }

    async set(key, value) {
        const filePath = this._getFilePath(key);
        try {
            await fs.writeFile(filePath, JSON.stringify(value, null, 2));
        } catch (error) {
            console.error(`Erro ao salvar a chave "${key}":`, error);
        }
    }

    async delete(key) {
        const filePath = this._getFilePath(key);
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.error(`Erro ao excluir a chave "${key}":`, error);
        }
    }

    async all() {
        try {
            const files = await fs.readdir(this.dbPath);
            
            // Filtra apenas arquivos com extensão .json
            const jsonFiles = files.filter(file => path.extname(file) === '.json');

            const data = await Promise.all(jsonFiles.map(async (file) => {
                const key = path.basename(file, '.json');
                try {
                    const content = await fs.readFile(path.join(this.dbPath, file), 'utf-8');
                    return { key, value: JSON.parse(content) };
                } catch (error) {
                    console.error(`Erro ao ler o arquivo "${file}":`, error);
                    return null; // Ignora arquivos corrompidos
                }
            }));

            return data.filter(entry => entry !== null); // Filtra arquivos corrompidos
        } catch (error) {
            console.error('Erro ao obter todos os dados:', error);
            return [];
        }
    }
}

module.exports = CustomDB;
