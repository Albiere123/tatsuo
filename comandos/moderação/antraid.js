const { QuickDB } = require("quick.db");
const db = new QuickDB();
const Discord = require('discord.js')
exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if(message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"})
    if (!message.member.permissions.has(Discord.PermissionFlagsBits.ManageGuild)) {
        return message.reply("Você precisa da permissão `MANAGE_GUILD` para usar este comando.");
    }

    
    const action = args[0]?.toLowerCase();

    if (action === "ligar") {
        await db.set(`antiraid_${message.guild.id}`, true);
        return message.reply("O sistema de Anti-Raid foi **ativado**.");
    }

    if (action === "desligar") {
        await db.set(`antiraid_${message.guild.id}`, false);
        return message.reply("O sistema de Anti-Raid foi **desativado**.");
    }

    if (!action) {
        const isEnabled = await db.get(`antiraid_${message.guild.id}`);
        if (isEnabled) {
            return message.reply("O sistema de Anti-Raid está **ativado**.");
        } else {
            return message.reply("O sistema de Anti-Raid está **desativado**.");
        }
    }

    
    return message.reply("Comando inválido. Use `ligar`, `desligar`, ou verifique o status sem argumentos.");
};

exports.help = {
    name: "antiraid",
    aliases: [],
    description: "Ativa, desativa ou verifica o status do sistema de Anti-Raid no servidor.",
    status: false
};
