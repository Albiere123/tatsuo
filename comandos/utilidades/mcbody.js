const Discord = require('discord.js');
const status = false;

exports.run = async (client, message, args) => {
const reason = args.slice(0).join(' ')
client.user.setActivity({name: `Com ${client.users.size} Usuarios.`, type: "WATCHING"})
      const embedrr = new Discord.EmbedBuilder()
      .setTitle(' | MCBody - Erro')
      .setColor(client.cor)
      .setDescription(` | Erro: \n \nVocê precisa citar um nick de minecraft.\n`)
      
      if (reason.length < 1) return message.reply({embeds: [embedrr]})

      const embed = new Discord.EmbedBuilder()
        .setTitle(` Corpo De: ${args[0]}`)
        .setImage(`https://mc-heads.net/player/${args[0]}`)
        .setColor(client.cor)
      message.channel.send({embeds: [embed]})
}

exports.help = {
    name: "mcbody",
    aliases: [],
    description: "Veja o corpo de uma skin do minecraft! Usage: {prefixo}mcbody <nickname>",
    status: status
}