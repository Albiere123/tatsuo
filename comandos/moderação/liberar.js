const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async(client, message, args) => {
    if (message.author.id !== client.dev.id) return;

    let embed = new Discord.EmbedBuilder().setColor(client.cor);

    if (!args[0]) {
        client.setError(embed, "Você deve especificar o nome do comando ou 'all' para alterar o status de todos os comandos.");
        client.setUsage(embed, `${client.prefix}setstatus <comando|all> [on/off]`);
        return message.reply({embeds: [embed]});
    }

    const statusArg = args[1] ? args[1].toLowerCase() : null;

    if (args[0].toLowerCase() === "all") {
        if (statusArg === "on") {
            for (let command of client.comandos.values()) {
                await db.set(`${command.help.name}_privado`, true);
            }
            embed.setTitle("Todos os Comandos Liberados")
                .setDescription("Todos os comandos foram liberados com sucesso!");
        } else if (statusArg === "off") {
            for (let command of client.comandos.values()) {
                await db.set(`${command.help.name}_privado`, false);
            }
            embed.setTitle("Todos os Comandos Em Manutenção")
                .setDescription("Todos os comandos foram colocados em manutenção!");
        } else {
            client.setError(embed, "Você deve especificar se deseja ligar ou desligar todos os comandos.");
            client.setUsage(embed, `${client.prefix}setstatus all [on/off]`);
            return message.reply({embeds: [embed]});
        }
    } else {
        const commandName = args[0].toLowerCase();
        const command = client.comandos.get(commandName) || client.comandos.get(client.aliases.get(commandName));

        if (!command) {
            client.setError(embed, "Comando não encontrado.");
            client.setUsage(embed, `${client.prefix}setstatus <comando|all> [on/off]`);
            return message.reply({embeds: [embed]});
        }

        if (statusArg === "on") {
            await db.set(`${command.help.name}_privado`, true);
            embed.setTitle("Comando Liberado")
                .setDescription(`O comando \`${command.help.name}\` foi liberado com sucesso!`);
        } else if (statusArg === "off") {
            await db.set(`${command.help.name}_privado`, false);
            embed.setTitle("Comando Em Manutenção")
                .setDescription(`O comando \`${command.help.name}\` foi colocado em manutenção!`);
        } else {
            client.setError(embed, "Você deve especificar se deseja ligar ou desligar o comando.");
            client.setUsage(embed, `${client.prefix}setstatus <comando|all> [on/off]`);
            return message.reply({embeds: [embed]});
        }
    }

    message.reply({embeds: [embed]});
}

exports.help = {
    name: "setstatus",
    aliases: ["ss"],
    description: "",
    status: false
};
