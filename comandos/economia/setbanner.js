const Discord = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const axios = require('axios');

const isValidPNGUrl = async (url) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    try {
        const response = await axios.head(url);
        return response.headers['content-type'] === 'image/png' || response.headers['content-type'] == "image/jpeg";
    } catch (error) {
        return false;
    }
};

exports.run = async (client, message, args) => {
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }
    let user = await db.get(`${message.author.id}`)
    if(user.money <= 2000) return message.reply({content: "Por favor, você possue menos de R$ 2000, tente coletar o daily"}) 

    if (args.length === 0) {
        return message.reply({ content: "Por favor, forneça um link de imagem PNG ou JPEG." });
    }

    const url = args[0];

    if (await isValidPNGUrl(url)) {
        await db.set(`background_${message.author.id}`, url);
        await db.set(`${message.author.id}`, {
            money: (await user.money) - 2000,
            sb: (await user.sb),
            trabalho: (await user.trabalho)
        })
        message.reply({ content: "BackGround atualizado com sucesso!" });
    } else {
        message.reply({ content: "O link fornecido não é uma imagem PNG válida." });
    }
};

exports.help = {
    name: 'setbackground',
    aliases: ['setbg'],
    description: 'Define um fundo personalizado para o perfil. Usage: {prefixo}setbackground <link>',
    status: false
};
