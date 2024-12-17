const Discord = require('discord.js');
const fs = require('fs');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    const comandosPorPagina = 5;
    let comandosDiversão = [];
    let comandosModeração = [];
    let comandosUtilidades = [];
    let comandosEconomia = [];

    const processCommands = async (folder, category) => {
        const commandFiles = fs.readdirSync(`./comandos/${folder}/`).filter(file => file.endsWith('.js'));

        const commands = commandFiles.map(file => {
            const filePath = `../../comandos/${folder}/${file}`;
            const command = require(filePath);

            if (!command || !command.help || !command.help.name || !command.help.aliases || !command.help.description) {
                return null;
            }

            return command;
        }).filter(cmd => cmd !== null);

        commands.sort((a, b) => a.help.name.localeCompare(b.help.name));

        for (const command of commands) {
            const statusIcon = (await db.get(`${command.help.name}_privado`)) ? `<:alternancia1:1275650302133145651>` : `<:ligar:1275650303726714911>`;
            let description = `\n ${statusIcon} **${command.help.name}** - \`${command.help.description}\``;
            description = description.replaceAll("{prefixo}", client.prefix)
            if (category === 'div') {
                comandosDiversão.push(description);
            } else if (category === 'mod') {
                comandosModeração.push(description);
            } else if (category === 'uti') {
                comandosUtilidades.push(description);
            } else if (category === 'eco') {
                comandosEconomia.push(description);
            }
        }
    };

    await processCommands('diversão', 'div');
    await processCommands('moderação', 'mod');
    await processCommands('utilidades', 'uti');
    await processCommands('economia', 'eco');

    const select = new Discord.StringSelectMenuBuilder()
        .setCustomId('select_menu')
        .setPlaceholder('Escolha uma categoria...')
        .addOptions([
            {
                label: "Menu Principal",
                value: "main",
                description: "Volte até o menu principal!",
                emoji: "1275650280850984961"
            },
            {
                label: 'Diversão',
                value: 'div',
                description: 'Comandos de diversão',
                emoji: "1275651261554753566"
            },
            {
                label: 'Moderação',
                value: 'mod',
                description: 'Comandos de moderação',
                emoji: "1275652176437317653"
            },
            {
                label: 'Utilidades',
                value: 'uti',
                description: 'Comandos de utilidades',
                emoji: "1275651259524976681"
            },
            {
                label: "Economia",
                description: "Comandos de economia",
                value: "eco",
                emoji: "1275650298005950494"
            }
        ]);

    const row = new Discord.ActionRowBuilder().addComponents(select);

    let main = new Discord.EmbedBuilder()
        .setDescription(`# <:global:1275650280850984961> Central de ajuda
ㅤ
**<:aviaodepapel:1275650291357847583> Como Usar **
ㅤ- Veja se os comandos estão em desenvolvimento da seguinte maneira:

**<:alternancia1:1275650302133145651> Funcionando Bem
<:ligar:1275650303726714911> Em Desenvolvimento**

**<:guia:1275650254384926781> Categorias**<:seta2:966325688745484338>
ㅤ<:confete:1275651261554753566> **Diversão**
ㅤ<:homemdenegocios:1275652176437317653> **Moderação**
ㅤ<:lampadadeideia:1275651259524976681> **Utilidades**
ㅤ<:dinheiro:1275650298005950494> **Economia**`)
        .setColor(client.cor)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/4726/4726140.png');

    let msg = await message.reply({ embeds: [main], components: [row] });

    let buttonCollector;

    const filter = i => i.customId === 'select_menu' && i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    const renderPage = (commandsArray, page, title, emoji) => {
        const totalPages = Math.ceil(commandsArray.length / comandosPorPagina);
        const paginatedCommands = commandsArray.slice((page - 1) * comandosPorPagina, page * comandosPorPagina);
        let embed = new Discord.EmbedBuilder()
            .setDescription(`# ${emoji} ${title}\nㅤ\n${paginatedCommands.join('\n')}`)
            .setColor(client.cor)
            .setFooter({ text: `Página ${page} de ${totalPages}` })
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/4726/4726140.png');
        return embed;
    };

    collector.on('collect', async interaction => {
        const selectedValue = interaction.values[0];
        let page = 1;

        const buttons = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder().setCustomId('prev').setLabel('⬅️ Anterior').setStyle('Primary').setDisabled(true),
            new Discord.ButtonBuilder().setCustomId('next').setLabel('➡️ Próxima').setStyle('Primary'),
            new Discord.ButtonBuilder().setCustomId("voltar").setLabel("🏡 Voltar ao Inicio").setStyle("Primary")
        );

        let embed;
        let commandsArray;
        let title;
        let emoji;

        if (selectedValue === "div") {
            commandsArray = comandosDiversão;
            title = 'Diversão';
            emoji = '<:confete:1275651261554753566>';
        } else if (selectedValue === "mod") {
            commandsArray = comandosModeração;
            title = 'Moderação';
            emoji = '<:homemdenegocios:1275652176437317653>';
        } else if (selectedValue === "uti") {
            commandsArray = comandosUtilidades;
            title = 'Utilidades';
            emoji = '<:lampadadeideia:1275651259524976681>';
        } else if (selectedValue === "eco") {
            commandsArray = comandosEconomia;
            title = 'Economia';
            emoji = '<:dinheiro:1275650298005950494>';
        } else {
            embed = main;
            await msg.edit({ embeds: [embed], components: [row] });
            return;
        }

        embed = renderPage(commandsArray, page, title, emoji);
        await interaction.update({ embeds: [embed], components: [buttons] });

        
        if (buttonCollector) {
            buttonCollector.stop();
        }

        buttonCollector = msg.createMessageComponentCollector({ filter: btn => btn.user.id === message.author.id, time: 60000 });

        buttonCollector.on('collect', async buttonInteraction => {
            if (buttonInteraction.customId === "voltar") {
                await buttonInteraction.update({ embeds: [main], components: [row] });
                buttonCollector.stop();
                return;
            } else if (buttonInteraction.customId === 'next') {
                page++;
            } else if (buttonInteraction.customId === 'prev') {
                page--;
            }

            const totalPages = Math.ceil(commandsArray.length / comandosPorPagina);
            buttons.components[0].setDisabled(page === 1); // Desabilitar "Anterior" se estiver na primeira página
            buttons.components[1].setDisabled(page === totalPages); // Desabilitar "Próxima" se estiver na última página

            embed = renderPage(commandsArray, page, title, emoji);
            await buttonInteraction.update({ embeds: [embed], components: [buttons] });
        });

        buttonCollector.on('end', (collected, reason) => {
            if (reason === 'time') {
                msg.edit({
                    content: 'Tempo expirado!',
                    embeds: [],
                    components: []
                });
            }
        });
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            msg.edit({
                content: 'Tempo expirado!',
                embeds: [],
                components: []
            });
        }
    });
};

exports.help = {
    name: "help",
    aliases: ["ajuda"],
    status: false,
    description: "Comando de ajuda. Usage: {prefixo}help"
};
