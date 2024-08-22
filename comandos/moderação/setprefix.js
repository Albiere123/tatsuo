const Discord = require('discord.js')
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const config = require("../../config.json")
exports.run = async(client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if(message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"})
    let erro = new Discord.EmbedBuilder()

    if(!message.guild.members.cache.get(message.author.id).permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
        client.setError(erro, `Você não possue permissão! Permissão necessária \`Manage Guild\``)
        client.setUsage(erro, `${client.prefix}setprefix <novo prefixo>`)
        message.reply({embeds: [erro]})
    }

    if(!args[0]) {
        client.setError(erro, `Coloque um prefixo!`)
        client.setUsage(erro, `${client.prefix}setprefix <novo prefixo>`)
        return message.reply({embeds: [erro]})
}
    if (args[0].includes("\n") || args[0].includes("\r")) {
        client.setError(erro, `Evite usar quebra de linha.`)
        client.setUsage(erro, `${client.prefix}setprefix <novo prefixo>`)
        return message.reply({embeds: [erro]}) 
    }
    
    
    let prefixo = args[0]
    if(args[0] === "delete") prefixo = config.prefix

    if(!prefixo === config.prefix) {
    if(prefixo === args[0] && prefixo.length > 2) {
        client.setError(erro, `Evite prefixos compostos. Exemplo de prefixos válidos: \`k?\`, \`t.\``)
        client.setUsage(erro, `${client.prefix}setprefix <novo prefixo>`)
        return message.reply({embeds: [erro]})
    }}

    let guild = await db.get(`${message.guild.id}.config`);
    let aprefix = guild?.prefix || config.prefix;

    if(aprefix == prefixo) {
        client.setError(erro, `Evite colocar o mesmo prefix anterior!`)
        client.setUsage(erro, `${client.prefix}setprefix <novo prefixo>`)
        return message.reply({embeds: [erro]})
    }

    let embed = new Discord.EmbedBuilder()
    .setDescription(`# <:global:1275650280850984961> Prefixo\nㅤ`)
    .addFields(
        {
            name: `**<:guia:1275650254384926781> Antigo prefixo**`, value: `${aprefix}`
        }, {
            name: `**<:codificacao:1275650255991472158> Novo prefixo**`, value: `${prefixo}`
        }
    )
    .setColor(client.cor)
    .setThumbnail(client.user.avatarURL({size: 2048, extension: "png"}))
    db.set(`${message.guild.id}.config.prefix`, prefixo)
    message.reply({embeds: [embed]})
}

exports.help = {
    name: "setprefix",
    aliases: ['prefix'],
    description: `Altere o meu prefixo! {prefixo}setprefix <novo prefixo>`,
    status: false
}