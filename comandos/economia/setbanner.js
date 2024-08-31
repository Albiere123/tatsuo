const Discord = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const axios = require('axios');
const { Readable } = require('stream');
const sharp = require('sharp'); 

const isValidPNGUrl = async (url) => {
    try {
        
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'];

        
        if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
            return false;
        }

        
        const imageBuffer = Buffer.from(response.data);
        const image = sharp(imageBuffer);

        
        await image.metadata();

        return true;
    } catch (error) {
        return false;
    }
};

exports.run = async (client, message, args) => {
    if (message.author.id !== client.dev.id && (await db.get(`${this.help.name}_privado`)) === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    let user = await db.get(`${message.author.id}`);
    if (user.money <= 2000) {
        return message.reply({ content: "Por favor, você possui menos de R$ 2000. Tente coletar o daily." });
    }

    if (args.length === 0) {
        return message.reply({ content: "Por favor, forneça um link de imagem PNG ou JPEG." });
    }

    const url = args[0];

    if (await isValidPNGUrl(url)) {
        await db.set(`background_${message.author.id}`, url);
        await db.set(`${message.author.id}`, {
            money: user.money - 2000,
            sb: user.sb,
            trabalho: user.trabalho,
            investimentos: user.investimentos? user.investimentos : null
        });
        message.reply({ content: "Background atualizado com sucesso!" });
    } else {
        message.reply({ content: "O link fornecido não é uma imagem PNG ou JPEG válida." });
    }
};

exports.help = {
    name: 'setbackground',
    aliases: ['setbg'],
    description: 'Define um fundo personalizado para o perfil. Usage: {prefixo}setbackground <link>',
    status: false
};
