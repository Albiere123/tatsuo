const Discord = require("discord.js");
const axios = require("axios");
const api = require("../../api.json")
const status = true;
exports.run = async (client, message, args) => {
    if(message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"})
    let error = new Discord.EmbedBuilder()
    let mention = await message.mentions.users.first();
    if (!mention) {
        client.setError(error, `Por favor, peço que mencione um usuário!`)
        client.setUsage(error, `${client.prefix}slap <usuário>`)
        return message.reply({embeds: [error]})
    }

    if (mention.id === message.author.id) {
        client.setError(error, `Poderia não mencionar a sí mesmo?`)
        client.setUsage(error, `${client.prefix}slap <usuário>`)
        return message.reply({embeds: [error]})
    }
        let imageUrl = api.slap[Math.floor(Math.random() * api.slap.length)]
        let embed = new Discord.EmbedBuilder()
            .setTitle(`<:cafe:820694213866946591> | Slap`)
            .setDescription(`ㅤ\n${message.author.username} acertou um tapa em ${mention.username}`)
            .setImage(imageUrl)
            .setColor(client.cor);
        
        message.reply({ embeds: [embed] });
};

exports.help = {
    name: "slap",
    aliases: ["tapa"],
    description: `Dê um tapa em um usuário! {prefixo}slap <usuário>`,
    status: status
};
