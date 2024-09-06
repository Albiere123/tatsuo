const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status == false) return message.reply({ content: "Este comando está em manutenção!" });

    if (!message.member.permissions.has(Discord.PermissionFlagsBits.MuteMembers)) return message.reply("Você não tem permissão para mutar membros.");

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!member && args.length > 0) {
        const usernameOrDisplayName = args.join(' ');
        member = message.guild.members.cache.find(u => u.user.username.toLowerCase() === usernameOrDisplayName.toLowerCase() || `${u.user.username.toLowerCase()}#${u.user.discriminator}` === usernameOrDisplayName.toLowerCase());
    }
    if (!member) return message.reply("Você deve mencionar um usuário válido para mutar.");

    const duration = args[1];
    const reason = args.slice(2).join(" ") || "Nenhuma razão fornecida";
    const id = await db.get(`dashboard_${message.guild.id}`)?.muterole?.id
    const muteRole = message.guild.roles.cache.find(role => role.id === id);
    
    if (!muteRole) return message.reply("Não há um cargo de `mute` definido no servidor. Use ta.dashboard para definir.");

    await member.roles.add(muteRole, reason);

    const embed = new Discord.EmbedBuilder()
        .setTitle("Usuário Mutado")
        .setColor(client.cor)
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
            { name: "Usuário", value: `${member.user.tag} (${member.id})`, inline: true },
            { name: "Moderador", value: `${message.author.tag} (${message.author.id})`, inline: true },
            { name: "Motivo", value: reason },
            { name: "Duração", value: duration ? `${duration} minutos` : "Indefinido" }
        )
        .setTimestamp();

    message.reply({ embeds: [embed] });

    if (duration && !isNaN(duration)) {
        await db.set(`tempmute_${member.id}`, {
            guildId: message.guild.id,
            endTime: Date.now() + duration * 60 * 1000 // Tempo de expiração
        });
    }
};

exports.help = {
    name: "mute",
    aliases: [],
    description: "Muta um membro no servidor, com suporte para mute temporário.",
    status: false
};
