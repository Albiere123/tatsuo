const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    // Verificar se o comando está em manutenção
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status === false) 
        return message.reply({ content: "Este comando está em manutenção!" });

    // Verificar permissões
    if (!message.member.permissions.has(Discord.PermissionFlagsBits.KickMembers)) {
        return message.reply("Você precisa da permissão `KICK MEMBERS` para usar este comando.");
    }

    // Verificar se o bot tem permissão
    if (!message.guild.members.me.permissions.has(Discord.PermissionFlagsBits.KickMembers)) {
        return message.reply("Eu preciso da permissão `KICK MEMBERS` para executar este comando.");
    }

    // Verificar se o usuário foi mencionado ou se foi fornecido o ID
    let member = message.mentions.members.first() || await message.guild.members.fetch(args[0]).catch(() => null);
    if (!member) {
        return message.reply("Você precisa mencionar um usuário válido ou fornecer um ID de usuário válido.");
    }

    // Verificar se o usuário pode ser kickado
    if (!member.kickable) {
        return message.reply("Não posso kickar este usuário. Pode ser que ele tenha um cargo maior ou igual ao meu.");
    }

    // Motivo do kick
    let reason = args.slice(1).join(" ");
    if (!reason) reason = "Nenhum motivo fornecido";

    // Executar o kick
    await member.kick(reason).catch(error => {
        console.error(`Erro ao kickar: ${error}`);
        return message.reply(`Desculpe, ocorreu um erro ao tentar kickar o usuário: ${error.message}`);
    });

    // Enviar uma mensagem de confirmação
    message.reply({ content: `✅ ${member.user.tag} foi kickado com sucesso. Motivo: ${reason}` });

    // Enviar log para o canal de logs, se configurado
    const dashboard = await db.get(`dashboard.${message.guild.id}.canais`) || {};
    const logsChannelId = dashboard.logs ? dashboard.logs.id : null;
    if (logsChannelId) {
        const logsChannel = await message.guild.channels.fetch(logsChannelId).catch(() => null);
        if (logsChannel) {
            const kickEmbed = new Discord.EmbedBuilder()
                .setTitle("Usuário Kickado")
                .setColor(client.cor)
                .setThumbnail(member.user.displayAvatarURL())
                .addFields(
                    { name: "Usuário", value: `${member.user.tag} (${member.id})`, inline: true },
                    { name: "Staff", value: `${message.author.tag} (${message.author.id})`, inline: true },
                    { name: "Motivo", value: reason }
                )
                .setTimestamp();

            logsChannel.send({ embeds: [kickEmbed] });
        }
    }
};

exports.help = {
    name: "kick",
    aliases: [],
    description: "Kicka um usuário do servidor. Usage: {prefixo}kick @usuário [motivo]",
    status: false
};
