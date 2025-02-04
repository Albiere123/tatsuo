const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { Mistral } = require("@mistralai/mistralai");

exports.run = async (client, message, args) => {
    const functions = require("../../functions.js");
    const status = (await db.get(`${this.help.name}_privado`)) || false;

    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: await functions.tradutor(await functions.getServerLanguage(message.guild.id), "manutenção")});
    }
    
    if (!args[0]) return message.reply("Coloque algo para falar!");

    const mistral = new Mistral({
        apiKey: "FgsxSoh1IP2jlaZy2bKqCSO0YjJxG7OW",
    });

    try {
        const response = await mistral.chat.complete({
            model: "mistral-medium",
            messages: [
                { role: "system", content: "Você é um assistente útil que responde apenas em português. Você server para tirar dúvidas de programação como: python, javascript, java, etc." },
                { role: "user", content: args.join(" ") }
            ],
            max_tokens: 500
        });

        message.reply(response.choices[0].message.content);
    } catch (error) {
        console.error("Erro na API da Mistral:", error);
        message.reply("🚫 Erro ao acessar a IA. Tente novamente mais tarde!");
    }
};

exports.help = {
    name: "ia",
    aliases: [],
    description: "",
    status: false
};
