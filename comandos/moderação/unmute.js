const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status == false) return message.reply({ content: "Este comando está em manutenção!" });

    if (!message.member.permissions.has('MUTE_MEMBERS')) return message.reply("Você não tem permissão para desmutar membros.");

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!member && args.length > 0) {
        const usernameOrDisplayName = args.join(' ');
        member = message.guild.members.cache.find(u => u.user.username.toLowerCase() === usernameOrDisplayName.toLowerCase() || `${u.user.username.toLowerCase()}#${u.user.discriminator}` === usernameOrDisplayName.toLowerCase());
    }
    if (!member) return message.reply("Você deve mencionar um usuário válido para desmutar.");

    const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');

    if (!muteRole) return message.reply("Não há um cargo de `Muted` no servidor.");

    await member.roles.remove(muteRole);

    message.reply(`O usuário ${member.user.tag} foi desmutado.`);
};

exports.help = {
    name: "unmute",
    aliases: [],
    description: "Desmuta um membro no servidor. {prefixo}unmute <@user>",
    status: false
};
