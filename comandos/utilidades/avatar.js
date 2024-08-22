const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

   let mention = message.mentions.users.first() || client.users.cache.get(args[0]);

    if (!mention && args.length > 0) {
        const usernameOrDisplayName = args.join(' ');
        let user = client.users.cache.find(u => u.username.toLowerCase() === usernameOrDisplayName.toLowerCase() || `${u.username.toLowerCase()}#${u.discriminator}` === usernameOrDisplayName.toLowerCase());
        mention = user;
    }

    if (!mention) mention = message.author;

    let embed = new Discord.EmbedBuilder()
        .setColor(client.cor) // Define uma cor padrão se client.cor não estiver definido
        .setImage(mention.avatarURL({ size: 4096, extension: "png" }))
        .setDescription(`# <:imagem:1275650259707629589> Avatar
ㅤ
**<:doutilizador:1275838621043396681> Usuário:** ${mention.username}
**<:paradownload:1275838205505179759> [Download](${mention.avatarURL({ size: 4096, extension: "png" })})**
ㅤ`);

    message.reply({ embeds: [embed] });
}

exports.help = {
    name: "avatar",
    aliases: [],
    description: "Veja a foto de perfil de um usuário. Usage: {prefixo}avatar [menção/username#discriminator]",
    status: false
}
