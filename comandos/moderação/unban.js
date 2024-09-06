const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status == false) return message.reply({ content: "Este comando está em manutenção!" });

    if (!message.member.permissions.has('BAN_MEMBERS')) return message.reply("Você não tem permissão para desbanir membros.");

    const userId = args[0];
    if (!userId) return message.reply("Você deve fornecer o ID de um usuário para desbanir.");

    const reason = args.slice(1).join(" ") || "Nenhuma razão fornecida";
    await message.guild.members.unban(userId, reason);

    message.reply(`O usuário <@${userId}> foi desbanido.`);
};

exports.help = {
    name: "unban",
    aliases: [],
    description: "Desbane um membro do servidor. {prefixo}unban <id>",
    status: false
};
