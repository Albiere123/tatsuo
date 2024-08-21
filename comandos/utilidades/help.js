const Discord = require('discord.js');
const fs = require('fs');
const status = true;

exports.run = async (client, message, args) => {
    if(message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"})

    let comandosDiversão = ``;
    let comandosModeração = ``;
    let comandosUtilidades = ``;
    let comandosEconomia = ``;
    const processCommands = (folder, category) => {
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
    
        commands.forEach(command => {
            const statusIcon = command.help.status ? `<:on:967571760419590174>` : `<:off:967571783014297620>`;
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
        });
    };
    

    processCommands('diversão', 'div');
    processCommands('moderação', 'mod');
    processCommands('utilidades', 'uti');
    processCommands("economia", "eco");
    comandosDiversão = comandosDiversão.replaceAll("{prefixo}", `${client.prefix}`);
    comandosModeração = comandosModeração.replaceAll("{prefixo}", `${client.prefix}`);
    comandosUtilidades = comandosUtilidades.replaceAll("{prefixo}", `${client.prefix}`);
    comandosEconomia = comandosEconomia.replaceAll("{prefixo}", `${client.prefix}`);
    const select = new Discord.StringSelectMenuBuilder()
        .setCustomId('select_menu')
        .setPlaceholder('Escolha uma categoria...')
        .addOptions([
            {
                label: "Menu Principal",
                value: "main",
                description: "Volte até o menu principal!",
                emoji: "966744634250375259",
                default: true
            },
            {
                label: 'Diversão',
                value: 'div',
                description: 'Comandos de diversão',
                emoji: "1268992704998805524"
            },
            {
                label: 'Moderação',
                value: 'mod',
                description: 'Comandos de moderação',
                emoji: "820694265772113930"
            },
            {
                label: 'Utilidades',
                value: 'uti',
                description: 'Comandos de utilidades',
                emoji: "820694351079669820"
            }, {
                label: "Economia",
                description: "Comandos de economia",
                value: "eco",
                emoji: "820694376052424725"
            }
        ]);

    const row = new Discord.ActionRowBuilder().addComponents(select);


    let main = new Discord.EmbedBuilder()
        .setDescription(`# <:config:966744634250375259> | Central de ajuda
ㅤ
**[ <:definicoes:966744970671317032> ] Como Usar **
ㅤ-  Veja se os comandos estão em desenvolvimento da seguinte maneira:

**( <:on:967571760419590174> ) Funcionando Bem
( <:off:967571783014297620> ) Em Desenvolvimento**

**-= <:pasta:820693985877557278> =- Categorias**<:seta2:966325688745484338>
ㅤ<:mmm:1268992704998805524> **Diversão**
ㅤ<:shield:820694265772113930> **Moderação**
ㅤ<:jornal:820694351079669820> **Utilidades**
ㅤ<:money:820694376052424725> **Economia**`)
        .setColor(client.cor)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/4726/4726140.png');

    let util = new Discord.EmbedBuilder()
        .setTitle(`<:jornal:820694351079669820> | Utilidades`)
        .setDescription(`ㅤ` + comandosUtilidades)
        .setColor(client.cor)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/4726/4726140.png');

    let div = new Discord.EmbedBuilder()
        .setTitle(`<:mmm:1268992704998805524> | Diversão`)
        .setDescription(`ㅤ` + comandosDiversão)
        .setColor(client.cor)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/4726/4726140.png');

    let mod = new Discord.EmbedBuilder()
        .setTitle(`<:shield:820694265772113930> | Moderação`)
        .setDescription(`ㅤ` + comandosModeração)
        .setColor(client.cor)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/4726/4726140.png');
    let eco = new Discord.EmbedBuilder()
        .setTitle(`<:money:820694376052424725> | Economia`)
        .setDescription(`ㅤ` + comandosEconomia)
        .setColor(client.cor)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/4726/4726140.png')
    let msg = await message.reply({embeds: [main], components: [row]});

    const filter = i => i.customId === 'select_menu' && i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 }); // 60 segundos

    collector.on('collect', async interaction => {
        const selectedValue = interaction.values[0];

        if (selectedValue === "uti") {
            await interaction.update({embeds: [util]});
        } else if (selectedValue === "div") {
            await interaction.update({embeds: [div]});
        } else if (selectedValue === "mod") {
            await interaction.update({embeds: [mod]});
        } else if (selectedValue === "main") {
            await interaction.update({embeds: [main]});
        }else if (selectedValue == "eco") {
            await interaction.update({embeds: [eco]})
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
    status: status,
    description: "Comando de ajuda. Usage: {prefixo}help"
};