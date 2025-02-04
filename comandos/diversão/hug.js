const Discord = require("discord.js");
const axios = require("axios");
const api = require("../../api.json")
const {QuickDB} = require('quick.db')
const db = new QuickDB()

exports.run = async (client, message, args) => {
    const functions = require("../../functions.js")
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && status === false) {

        return message.reply({ content: await functions.tradutor(await functions.getServerLanguage(message.guild.id), "manutenção")});
    }
    let error = new Discord.EmbedBuilder()
    let mention = message.mentions.users.first();
    if (!mention) {
        await client.setError(message, error, await functions.tradutor(await functions.getServerLanguage(message.guild.id), "hug.erro_mention"))
        await client.setUsage(error, `${client.prefix}hug <usuário>`)
        return message.reply({embeds: [error]})
    }

    if (mention.id === message.author.id) {
        await client.setError(message, error, await functions.tradutor(await functions.getServerLanguage(message.guild.id), "hug.erro_self_mention"))
        await client.setUsage(error, `${client.prefix}hug <usuário>`)
        return message.reply({embeds: [error]})
    }

    const button = 
        new Discord.ButtonBuilder()
    .setCustomId("ret")
    .setEmoji("1275650265206493276")
    .setStyle(Discord.ButtonStyle.Success)
    const row = new Discord.ActionRowBuilder().addComponents(button)

    let imageUrl = api.hug[Math.floor(Math.random() * api.kiss.length)]
    let embed = new Discord.EmbedBuilder()
        .setTitle(`<:cafe:820694213866946591> | Hug`)
        .setDescription(await functions.tradutor(await functions.getServerLanguage(message.guild.id), "hug.hug_description", {autor: message.author.username, mencionado: mention.username}))
        .setImage(imageUrl)
        .setColor(client.cor);
    
    const msg = await message.reply({ embeds: [embed], components: [row] });
    const filter = i => i.user.id == mention.id;
    const collector = msg.createMessageComponentCollector({filter, max: 1})
    collector.on("collect", async col => {
        let id = col.customId
        if(id === "ret") {
            imageUrl = await api.hug[Math.floor(Math.random() * api.kiss.length)]
            let embed = new Discord.EmbedBuilder()
            .setTitle(`<:cafe:820694213866946591> | Hug`)
            .setDescription(await functions.tradutor(await functions.getServerLanguage(message.guild.id), "hug.hug_return_description", {autor: message.author.username, mencionado: mention.username}))
            .setImage(imageUrl)
            .setColor(client.cor)
            col.deferUpdate()
            return message.channel.send({embeds: [embed]})
        }
        col.deferUpdate();
    })
};

exports.help = {
    name: "hug",
    aliases: ["abraço", "abraco"],
    description: "Dê um abraço em um usuário! {prefixo}hug <usuário>",
    status: false
};
