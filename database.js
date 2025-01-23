const fs = require('fs').promises;
const path = require('path');

class CustomDB {
    constructor(name, dbPath = './data/') {
        this.dbPath = dbPath;
        this.dbFileName = `${name}.json`;
        this.dbFilePath = path.join(this.dbPath, this.dbFileName);

        
        fs.mkdir(this.dbPath, { recursive: true }).catch(console.error);

        
        fs.access(this.dbFilePath).catch(async () => {
            await this.setAll({});
        });
    }

    async _readFile() {
        try {
            const data = await fs.readFile(this.dbFilePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Erro ao ler o arquivo "${this.dbFileName}":`, error);
            return {};
        }
    }

    async _writeFile(data) {
        try {
            await fs.writeFile(this.dbFilePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Erro ao salvar o arquivo "${this.dbFileName}":`, error);
        }
    }

    async get(key) {
        const data = await this._readFile();
        return data[key];
    }

    async set(key, value) {
        const data = await this._readFile();
        data[key] = value;
        await this._writeFile(data);
    }

    async delete(key) {
        const data = await this._readFile();
        delete data[key];
        await this._writeFile(data);
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

    async setAll(data) {
        await this._writeFile(data);
    }
}

module.exports = CustomDB;
