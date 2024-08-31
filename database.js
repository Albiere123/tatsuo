const fs = require('fs');
const path = require('path');

class CustomDB {
    constructor(dbPath = './data/') {
        this.dbPath = dbPath;

        // Cria a pasta de dados se não existir
        if (!fs.existsSync(this.dbPath)) {
            fs.mkdirSync(this.dbPath, { recursive: true });
        }
    }

    _getFilePath(key) {
        return path.join(this.dbPath, `${key}.json`);
    }

    async get(key) {
        const filePath = this._getFilePath(key);
        if (!fs.existsSync(filePath)) {
            return undefined;
        }

        try {
            const data = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Erro ao ler a chave "${key}":`, error);
            return undefined;
        }
    }

    async set(key, value) {
        const filePath = this._getFilePath(key);
        try {
            fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
            
        } catch (error) {
            console.error(`Erro ao salvar a chave "${key}":`, error);
        }
    }

    async delete(key) {
        const filePath = this._getFilePath(key);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                
            } else {
                console.warn(`Chave "${key}" não encontrada.`);
            }
        } catch (error) {
            console.error(`Erro ao excluir a chave "${key}":`, error);
        }
    }

    async all() {
        try {
            const files = fs.readdirSync(this.dbPath);
            return files.map(file => {
                const key = path.basename(file, '.json');
                const data = fs.readFileSync(path.join(this.dbPath, file), 'utf-8');
                return { key, value: JSON.parse(data) };
            });
        } catch (error) {
            console.error('Erro ao obter todos os dados:', error);
            return [];
        }
    }
}

module.exports = CustomDB;
