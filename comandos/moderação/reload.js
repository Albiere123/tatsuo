const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

exports.run = async (client, message, args) => {
    if (message.author.id !== client.dev.id) return;

    const comandosModificadosPorCategoria = new Map();
    const commandMap = new Map(); 

    const reloadCommand = (local, fileName) => {
        const filePath = path.resolve(`./comandos/${local}/${fileName}`);
        const stats = fs.statSync(filePath);
        const lastModified = stats.mtime.getTime();

        
        if (client.lastReload && lastModified <= client.lastReload) {
            return false;
        }

        
        delete require.cache[require.resolve(filePath)];
        
        try {
            const command = require(filePath);
            client.comandos.set(command.help.name, command);
            command.help.aliases.forEach(alias => client.aliases.set(alias, command.help.name));

            if (!comandosModificadosPorCategoria.has(local)) {
                comandosModificadosPorCategoria.set(local, []);
            }
            comandosModificadosPorCategoria.get(local).push(command.help.name);
            return true;
        } catch (error) {
            console.error(`Erro ao recarregar o comando ${fileName}:`, error);
            return false;
        }
    };

    
    const createCommandMap = () => {
        fs.readdirSync('./comandos/').forEach(local => {
            let arquivos = fs.readdirSync(`./comandos/${local}`).filter(arquivo => arquivo.endsWith('.js'));
            for (let f of arquivos) {
                const filePath = path.resolve(`./comandos/${local}/${f}`);
                const command = require(filePath);
                commandMap.set(command.help.name, filePath);
                command.help.aliases.forEach(alias => commandMap.set(alias, filePath));
            }
        });
    };

    createCommandMap();

    if (!args[0]) {
        fs.readdirSync('./comandos/').forEach(local => {
            let arquivos = fs.readdirSync(`./comandos/${local}`).filter(arquivo => arquivo.endsWith('.js'));
            for (let f of arquivos) {
                reloadCommand(local, f);
            }
        });

        client.lastReload = Date.now();

        if (comandosModificadosPorCategoria.size === 0) {
            return message.reply({ content: "Nenhum comando foi modificado desde a última recarga." });
        }

        const embed = new Discord.EmbedBuilder()
            .setTitle('Comandos Recarregados')
            .setColor(client.cor)
            .setThumbnail(client.user.avatarURL());

        
        comandosModificadosPorCategoria.forEach((comandos, categoria) => {
            embed.addFields({
                name: `${categoria}`,
                value: comandos.map(cmd => `- **${cmd}**`).join('\n'),
                inline: false
            });
        });

        return message.reply({ embeds: [embed] });

    } else {
        const commandName = args[0].toLowerCase();
        const filePath = commandMap.get(commandName);

        if (!filePath) {
            return message.reply({ content: `Nenhum comando encontrado com o nome ou alias \`${commandName}\`!` });
        }

        const local = path.dirname(filePath).split(path.sep).pop();
        const fileName = path.basename(filePath);

        if (reloadCommand(local, fileName)) {
            return message.reply({ content: `O comando \`${commandName}\` foi recarregado com sucesso!` });
        } else {
            return message.reply({ content: `Nenhuma modificação foi detectada para o comando \`${commandName}\`.` });
        }
    }
};

exports.help = {
    name: "reload",
    aliases: ["recarregar"],
    status: false
};
