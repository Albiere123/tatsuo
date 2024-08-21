const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const status = true;

exports.run = async (client, message, args) => {
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    let guild;

    if (args[0] && !isNaN(args[0])) {
        guild = client.guilds.cache.get(args[0]);
    }

    if (!guild && args.length > 0) {
        const serverName = args.join(' ').toLowerCase();
        guild = client.guilds.cache.find(g => g.name.toLowerCase() === serverName);
    }

    if (!guild) guild = message.guild;

    let embed = new Discord.EmbedBuilder()
        .setColor(client.cor) 
        .setImage(guild.iconURL({ size: 4096, extension: "png" }))
        .setDescription(`# <:foto:966744694195363850> | ServerIcon
ㅤ
**( <:doutilizador1:966745480170180670> ) Servidor:** ${guild.name}
**( <:wifi:966765489130975232> ) [Download](${guild.iconURL({ size: 4096, extension: "png" })})**
ㅤ`);

   
    message.reply({ embeds: [embed] });
}

exports.help = {
    name: "servericon",
    aliases: ["iconserver"],
    description: "Veja o ícone de um servidor. Usage: {prefixo}servericon [ID do servidor ou nome do servidor (o bot tem que estar no servidor)]",
    status: status
}
