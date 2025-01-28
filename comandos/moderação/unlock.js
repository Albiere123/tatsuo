const { PermissionsBitField } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Discord = require("discord.js")
exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status == false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply("Você não tem permissão para desbloquear canais.");
    }
   
    
    const role = message.guild.roles.everyone;

    try {
        await message.channel.permissionOverwrites.edit(role, { SendMessages: true });

        const embed = new Discord.EmbedBuilder()
        .setColor(client.cor)
        .setTitle("Canal Desbloqueado")
        .setDescription("Este canal foi desbloqueado com sucesso. Os membros agora podem enviar mensagens.")
        .setTimestamp(new Date())

        message.reply({ embeds: [embed] });
    } catch (error) {
        await client.setError(message, error, `Erro ao executar o comando ${this.help.name}`);
        message.reply({ content: "Ocorreu um erro ao tentar desbloquear o canal. O erro foi registrado e será analisado." });
    }
};

exports.help = {
    name: "unlock",
    aliases: [],
    description: "Desbloqueia o canal atual, permitindo que membros enviem mensagens. {prefixo}unlock",
    status: false
};
