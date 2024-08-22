const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    let error = new Discord.EmbedBuilder();

    
    if (!message.member.permissions.has(Discord.PermissionFlagsBits.BanMembers)) {
        client.setError(error, `Parece que você não possui a permissão de \`Banir membros\``);
        return message.reply({ embeds: [error] });
    }

    
    if (!message.guild.members.cache.get(client.user.id).permissions.has(Discord.PermissionFlagsBits.ManageMessages)) {
        client.setError(error, `Estou sem um cargo com a permissão de \`Gerenciar Mensagens.\``);
        return message.reply({ embeds: [error] });
    }

    const subCommand = args[0];
    const guildId = message.guild.id;

    let erro = new Discord.EmbedBuilder()
        .setThumbnail(message.guild.iconURL({ size: 2048, extension: "png" }));

    
    const allowedRuleTypes = ['palavra', 'link'];

    if (!subCommand) {
        client.setError(erro, `Por favor, forneça um subcomando válido:`);
        client.setUsage(erro, `${client.prefix}auto-mod <add | remove | list | clear>`);
        return message.reply({ embeds: [erro] });
    }

    if (subCommand === "add") {
        const ruleType = args[1];
        const ruleValue = args.slice(2).join(' ');

        
        if (!allowedRuleTypes.includes(ruleType)) {
            client.setError(erro, `Tipo de regra inválido. Os tipos permitidos são: ${allowedRuleTypes.join(', ')}`);
            return message.reply({ embeds: [erro] });
        }

        if (!ruleType || !ruleValue) {
            client.setError(erro, `Comando utilizado de forma errada.`);
            client.setUsage(erro, `${client.prefix}auto-mod add <${allowedRuleTypes.join(' | ')}> <valor>`);
            return message.reply({ embeds: [erro] });
        }
        if(ruleType == "link" && !ruleValue === "true"  && !ruleValue == "false"){
                client.setError(erro, `Comando utilizado de forma errada!`)
                client.setUsage(erro, `${client.prefix}auto-mod add link <true ou false>`)
                return message.reply({embeds: [erro]})
            }

        await db.push(`automod_rules_${guildId}`, { type: ruleType, value: ruleValue });

        let embed = new Discord.EmbedBuilder()
            .setDescription(`# <:cracha:820694021487460352> | AutoMod

Regra adicionada: \`${ruleType}\` -> \`${ruleValue}\`.`)
            .setColor(client.cor)
            .setThumbnail(message.guild.iconURL({ size: 2048, extension: "png" }));

        message.reply({ embeds: [embed] });

    } else if (subCommand === "remove") {
        const ruleIndex = parseInt(args[1]);

        if (isNaN(ruleIndex)) {
            client.setError(erro, `Por favor, forneça um índice de regra válido para remover.`);
            client.setUsage(erro, `${client.prefix}auto-mod remove <índice>`);
            return message.reply({ embeds: [erro] });
        }

        const rules = await db.get(`automod_rules_${guildId}`);
        if (!rules || !rules[ruleIndex]) {
            client.setError(erro, `Regra não encontrada.`);
            return message.reply({ embeds: [erro] });
        }

        rules.splice(ruleIndex, 1);
        await db.set(`automod_rules_${guildId}`, rules);

        let embed = new Discord.EmbedBuilder()
            .setDescription(`# <:cracha:820694021487460352> AutoMod

Regra de auto-moderação removida.`)
            .setColor(client.cor)
            .setThumbnail(message.guild.iconURL({ size: 2048, extension: "png" }));

        message.reply({ embeds: [embed] });

    } else if (subCommand === "list") {
        const rules = await db.get(`automod_rules_${guildId}`);
        if (!rules || rules.length === 0) {
            client.setError(erro, `Nenhuma regra de auto-moderação foi configurada.`);
            return message.reply({ embeds: [erro] });
        }

        const rulesList = rules.map((rule, index) => `${index}: \`${rule.type}\` -> \`${rule.value}\``).join('\n');

        let embed = new Discord.EmbedBuilder()
            .setDescription(`# <:cracha:820694021487460352> AutoMod

Regras de auto-moderação configuradas:\n${rulesList}`)
            .setColor(client.cor)
            .setThumbnail(message.guild.iconURL({ size: 2048, extension: "png" }));

        message.reply({ embeds: [embed] });

    } else if (subCommand === "clear") {
        await db.delete(`automod_rules_${guildId}`);

        let embed = new Discord.EmbedBuilder()
            .setDescription(`# <:cracha:820694021487460352> AutoMod

Todas as regras de auto-moderação foram removidas.`)
            .setColor(client.cor)
            .setThumbnail(message.guild.iconURL({ size: 2048, extension: "png" }));

        message.reply({ embeds: [embed] });

    } else if (args[0] === "help") {
        let embed = new Discord.EmbedBuilder()
            .setColor(client.cor)
            .setDescription(`# <:cracha:820694021487460352> AutoMod

> **add:**
ㅤㅤAdiciona uma nova regra de moderação, como uma palavra proibida, uma frase ou uma condição para links.
ㅤㅤㅤ${client.prefix}auto-mod add palavra ban: Adiciona a palavra "ban" à lista de palavras proibidas.

> **remove:** 
ㅤㅤRemove uma regra específica com base no índice.
ㅤㅤㅤ${client.prefix}auto-mod remove 0: Remove a primeira regra da lista.

> **list:** 
ㅤㅤLista todas as regras de auto-moderação configuradas no servidor.
ㅤㅤㅤ${client.prefix}auto-mod list: Mostra todas as regras configuradas.

> **clear:** 
ㅤㅤRemove todas as regras configuradas.
ㅤㅤㅤ${client.prefix}auto-mod clear: Limpa todas as regras.`)
            .setThumbnail(message.guild.iconURL({ size: 2048, extension: "png" }));
        message.reply({ embeds: [embed] });
    } else {
        client.setError(erro, `Subcomando inválido. Use:`);
        client.setUsage(erro, `${client.prefix}auto-mod <add | remove | list | clear>`);
        return message.reply({ embeds: [erro] });
    }
};

exports.help = {
    name: "auto-mod",
    aliases: ["automod"],
    description: "Configura regras de moderação automatizada no servidor. Usage: {prefixo}auto-mod <add|remove|list|clear> [args]",
    status: false
};
