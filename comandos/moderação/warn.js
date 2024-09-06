const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    try {
        const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
        if (message.author.id !== client.dev.id && status == false) return message.reply({ content: "Este comando está em manutenção!" });

        if (!message.member.permissions.has('MANAGE_MESSAGES')) return message.reply("Você não tem permissão para avisar membros.");

        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!member && args.length > 0) {
        const usernameOrDisplayName = args.join(' ');
        member = message.guild.members.cache.find(u => u.user.username.toLowerCase() === usernameOrDisplayName.toLowerCase() || `${u.user.username.toLowerCase()}#${u.user.discriminator}` === usernameOrDisplayName.toLowerCase());
    }
        if (!member) return message.reply("Você deve mencionar um usuário válido para avisar.");

        const reason = args.slice(1).join(" ") || "Nenhuma razão fornecida";

        // Armazenando o aviso no banco de dados
        const warnings = (await db.get(`warnings_${member.id}`)) || [];
        warnings.push({
            reason: reason,
            date: new Date(),
            moderator: message.author.id,
            messageURL: message.url
        });
        await db.set(`warnings_${member.id}`, warnings);

        const embed = new Discord.EmbedBuilder()
            .setTitle("Usuário Avisado")
            .setColor(client.cor)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: "Usuário", value: `${member.user.tag} (${member.id})`, inline: true },
                { name: "Moderador", value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: "Motivo", value: reason }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    } catch (error) {
        client.setError(error, `Erro ao executar o comando ${this.help.name}`);
        message.reply({ content: "Ocorreu um erro ao tentar executar este comando. O erro foi registrado e será analisado." });
    }
};

exports.help = {
    name: "warn",
    aliases: [],
    description: "Avisa um membro e registra o aviso. {prefixo}warn <@user>",
    status: false
};
