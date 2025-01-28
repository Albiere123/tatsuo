const { PermissionsBitField, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Discord = require('discord.js')
exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status == false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply("Você não tem permissão para bloquear canais.");
    }
    
    const role = message.guild.roles.everyone;

    try {
        await message.channel.permissionOverwrites.edit(role, { SendMessages: false });

        const embed = new Discord.EmbedBuilder() 

        .setColor(client.cor)
        .setTitle("Canal Bloqueado")
        .setDescription("Este canal foi bloqueado com sucesso. Os membros não poderão enviar mensagens.")
        .setTimestamp(new Date())
        

        message.reply({ embeds: [embed] });
    } catch (error) {
        console.log(error.message)
        await client.setError(message, error, `Erro ao executar o comando ${this.help.name}`);
        message.reply({ content: "Ocorreu um erro ao tentar bloquear o canal. O erro foi registrado e será analisado." });
    }
};

exports.help = {
    name: "lock",
    aliases: [],
    description: "Bloqueia o canal atual, impedindo que membros enviem mensagens. Usage: {prefixo}lock",
    status: false
};
