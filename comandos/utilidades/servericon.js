const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
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
        .setDescription(`# <:imagem1:1275650286899167325> ServerIcon
ㅤ
**<:servidor:1275850903349366895> Servidor:** ${guild.name}
**<:paradownload:1275838205505179759> [Download](${guild.iconURL({ size: 4096, extension: "png" })})**
ㅤ`);

   
    message.reply({ embeds: [embed] });
}

exports.help = {
    name: "servericon",
    aliases: ["iconserver"],
    description: "Veja o ícone de um servidor. Usage: {prefixo}servericon [ID do servidor ou nome do servidor (o bot tem que estar no servidor)]",
    status: false
}
