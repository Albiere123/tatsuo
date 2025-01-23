const Discord = require("discord.js")
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const {getAPI} = require("../../functions.js")


exports.run = async(client, message, args) => {
    const functions = require("../../functions.js")
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: functions.tradutor(functions.getServerLanguage(message.guild.id), "manutenção")});
    }
    let embed = new Discord.EmbedBuilder()
    .setDescription(`# <:servidor:1275850903349366895> Meme Aleatório`)
    .setImage(`${await getAPI("memes",null,true)}`)
    .setColor(client.cor)
    message.reply({embeds: [embed]})
}

exports.help = {
    name: "memes",
    aliases: ["meme"],
    description: "Veja memes aleatórios. Usage {prefixo}memes",
    status: false
}