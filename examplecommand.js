const Discord = require("discord.js")
const { QuickDB } = require("quick.db");
const db = new QuickDB();



exports.run = async(client, message, args) => {
    const functions = require("../../functions.js")
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: await functions.tradutor(await functions.getServerLanguage(message.guild.id), "manutenção")});
    }
}

exports.help = {
    name: "",
    aliases: [],
    description: "",
    status: status
}