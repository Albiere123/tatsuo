const Discord = require('discord.js');
const fs = require('fs');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    let comandosDiversão = ``;
    let comandosModeração = ``;
    let comandosUtilidades = ``;
    let comandosEconomia = ``;

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
            const description = `\n ${statusIcon} **${command.help.name}** - \`${command.help.description}\``;
    
            if (category === 'div') {
                comandosDiversão += description;
            } else if (category === 'mod') {
                comandosModeração += description;
            } else if (category === 'uti') {
                comandosUtilidades += description;
            } else if (category == "eco") {
                comandosEconomia += description;
            }
        }
    
    };

    await processCommands('diversão', 'div');
    await processCommands('moderação', 'mod');
    await processCommands('utilidades', 'uti');
    await processCommands('economia', 'eco');


    comandosDiversão = comandosDiversão.replaceAll("{prefixo}", `${client.prefix}`);
    comandosModeração = comandosModeração.replaceAll(`{prefixo}`, `${client.prefix}`);
    comandosUtilidades = comandosUtilidades.replaceAll(`{prefixo}`, `${client.prefix}`);
    comandosEconomia = comandosEconomia.replaceAll(`{prefixo}`, `${client.prefix}`);

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
ㅤ-  Veja se os comandos estão em desenvolvimento da seguinte maneira:

**<:alternancia1:1275650302133145651> Funcionando Bem
<:ligar:1275650303726714911> Em Desenvolvimento**

**<:guia:1275650254384926781> Categorias**<:seta2:966325688745484338>
ㅤ<:confete:1275651261554753566> **Diversão**
ㅤ<:homemdenegocios:1275652176437317653> **Moderação**
ㅤ<:lampadadeideia:1275651259524976681> **Utilidades**
ㅤ<:dinheiro:1275650298005950494> **Economia**`)
        .setColor(client.cor)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/4726/4726140.png');

    let util = new Discord.EmbedBuilder()
        .setDescription(`# <:lampadadeideia:1275651259524976681> Utilidades
ㅤ\n${comandosUtilidades}`)
        .setColor(client.cor)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/4726/4726140.png');

    let div = new Discord.EmbedBuilder()
        .setDescription(`# <:confete:1275651261554753566> Diversão
ㅤ\n${comandosDiversão}`)
        .setColor(client.cor)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/4726/4726140.png');

    let mod = new Discord.EmbedBuilder()
        .setDescription(`# <:homemdenegocios:1275652176437317653> Moderação
ㅤ\n${comandosModeração}`)
        .setColor(client.cor)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/4726/4726140.png');

        let eco = new Discord.EmbedBuilder()
            .setDescription(`# <:dinheiro:1275650298005950494> Economia
ㅤ\n` + comandosEconomia)
            .setColor(client.cor)
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/4726/4726140.png');
        

    let msg = await message.reply({ embeds: [main], components: [row] });

    const filter = i => i.customId === 'select_menu' && i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async interaction => {
        const selectedValue = interaction.values[0];

        if (selectedValue === "uti") {
            await interaction.update({ embeds: [util] });
        } else if (selectedValue === "div") {
            await interaction.update({ embeds: [div] });
        } else if (selectedValue === "mod") {
            await interaction.update({ embeds: [mod] });
        } else if (selectedValue === "main") {
            await interaction.update({ embeds: [main] });
        } else if (selectedValue === "eco") {
            await interaction.update({ embeds: [eco] });
        }
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
