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
        return await this._readFile();
    }

    async setAll(data) {
        await this._writeFile(data);
    }
}

module.exports = CustomDB;
