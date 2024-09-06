const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    try {
        const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
        if (message.author.id !== client.dev.id && status == false) return message.reply({ content: "Este comando está em manutenção!" });

        if (!message.member.permissions.has('BAN_MEMBERS') && message.user.id != client.dev.id) return message.reply("Você não tem permissão para ver informações de banimentos.");

        const userId = args[0];
        if (!userId) return message.reply("Você deve fornecer um ID de usuário válido.");

        const banInfo = await message.guild.bans.fetch(userId).catch(() => null);
        if (!banInfo) return message.reply("Este usuário não está banido ou o ID fornecido é inválido.");

        const embed = new Discord.EmbedBuilder()
            .setTitle("Informações do Banimento")
            .setColor(client.cor)
            .setThumbnail(banInfo.user.displayAvatarURL())
            .addFields(
                { name: "Usuário", value: `${banInfo?.user.tag} (${banInfo?.user.id})`, inline: true },
                { name: "Moderador", value: banInfo?.moderator ? `<@${banInfo?.moderator.id}>` : "Desconhecido", inline: true },
                { name: "Motivo", value: banInfo?.reason || "Nenhuma razão fornecida" }
            )
            .setTimestamp();

        message.reply({ embeds: [embed] });
    } catch (error) {
        client.setError(error, `Erro ao executar o comando ${this.help.name}`);
        message.reply({ content: "Ocorreu um erro ao tentar executar este comando. O erro foi registrado e será analisado." });
    }
};

exports.help = {
    name: "baninfo",
    aliases: [],
    description: "Mostra detalhes sobre o banimento de um usuário. {prefixo}baninfo <ID>",
    status: false
};
