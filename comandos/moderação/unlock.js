const { PermissionsBitField } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status == false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply("Você não tem permissão para desbloquear canais.");
    }
    if(!message.guild.me.permissions.has(PermissionFlagsBits.ManageChannels)) return message.reply({content: "Não possuo a permissão `MANAGE_CHANNELS`"}) 
    
    const role = message.guild.roles.everyone;

    try {
        await message.channel.permissionOverwrites.edit(role, { SendMessages: true });

        const embed = {
            color: client.cor,
            title: "Canal Desbloqueado",
            description: "Este canal foi desbloqueado com sucesso. Os membros agora podem enviar mensagens.",
            timestamp: new Date()
        };

        message.reply({ embeds: [embed] });
    } catch (error) {
        client.setError(error, `Erro ao executar o comando ${this.help.name}`);
        message.reply({ content: "Ocorreu um erro ao tentar desbloquear o canal. O erro foi registrado e será analisado." });
    }
};

exports.help = {
    name: "unlock",
    aliases: [],
    description: "Desbloqueia o canal atual, permitindo que membros enviem mensagens. {prefixo}unlock",
    status: false
};
