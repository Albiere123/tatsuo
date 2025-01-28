const Discord = require("discord.js");
const axios = require("axios");
const api = require("../../api.json")
const {QuickDB} = require('quick.db')
const db = new QuickDB()
exports.run = async (client, message, args) => {
    const functions = require("../../functions.js")
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: functions.tradutor(functions.getServerLanguage(message.guild.id), "manutenção")});
    }
    let error = new Discord.EmbedBuilder()
    let mention = message.mentions.users.first();
    if (!mention) {
        await client.setError(message, error, `Por favor, peço que mencione um usuário!`)
        await client.setUsage(message, error, `${client.prefix}kiss <usuário>`)
        return message.reply({embeds: [error]})
    }

    if (mention.id === message.author.id) {
        await client.setError(message, error, `Poderia não mencionar a sí mesmo?`)
        await client.setUsage(message, error, `${client.prefix}kiss <usuário>`)
        return message.reply({embeds: [error]})
    }

    const button = 
        new Discord.ButtonBuilder()
    .setCustomId("ret")
    .setEmoji("1275650265206493276")
    .setStyle(Discord.ButtonStyle.Success)
    const row = new Discord.ActionRowBuilder().addComponents(button)

        let imageUrl = api.kiss[Math.floor(Math.random() * api.kiss.length)]
        let embed = new Discord.EmbedBuilder()
            .setTitle(`<:cafe:820694213866946591> | Kiss`)
            .setDescription(`ㅤ\n${message.author.username} beijou ${mention.username}`)
            .setImage(imageUrl)
            .setColor(client.cor);
        
            const msg = await message.reply({ embeds: [embed], components: [row] });
            const filter = i => i.user.id == mention.id;
            const collector = msg.createMessageComponentCollector({filter, max: 1})
            collector.on("collect", async col => {
                let id = col.customId
                if(id === "ret") {
                    imageUrl = await api.kiss[Math.floor(Math.random() * api.kiss.length)]
                    let embed = new Discord.EmbedBuilder()
                    .setTitle(`<:cafe:820694213866946591> | Kiss`)
                    .setDescription(`ㅤ\n${mention.username} retribuiu o beijo em ${message.author.username}`)
                    .setImage(imageUrl)
                    .setColor(client.cor)
                    col.deferUpdate()
                    return message.channel.send({embeds: [embed]})
                    
                }
                col.deferUpdate();
            })
};

exports.help = {
    name: "kiss",
    aliases: ["beijo"],
    description: `Dê um beijo em um usuário! {prefixo}kiss <usuário>`,
    status: false
};
