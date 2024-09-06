const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();


function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.slice(0, maxLength - 3) + '...';
    }
    return text;
}

exports.run = async (client, message, args) => {
    try {
        const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
        if (message.author.id !== client.dev.id && status == false) {
            return message.reply({content: "Este comando está em manutenção!"});
        }

        const totalMembers = message.guild.memberCount;
        const bots = message.guild.members.cache.filter(member => member.user.bot).size;
        const humans = totalMembers - bots;

        const roles = message.guild.roles.cache.filter(role => role.name != "@everyone");
        const rolesList = roles.map(role => role.toString());
        const roleChunks = [];
        const chunkSize = 25; // Limite para dividir a lista de cargos

        for (let i = 0; i < rolesList.length; i += chunkSize) {
            roleChunks.push(truncateText(rolesList.slice(i, i + chunkSize).join(', '), 1024));
        }

        const owner = message.guild.ownerId ? await message.guild.members.fetch(message.guild.ownerId) : null;
        const ownerHighestRole = owner ? owner.roles.highest : 'Desconhecido';
        const ownerCreationDate = owner ? owner.user.createdAt.toLocaleDateString('pt-BR') : 'Desconhecida';

        const voiceChannels = message.guild.channels.cache.filter(channel => channel.type === Discord.ChannelType.GuildVoice).size;
        const textChannels = message.guild.channels.cache.filter(channel => channel.type === Discord.ChannelType.GuildText).size;
        const channels = textChannels + voiceChannels;
        const membersWithHighestRole = message.guild.roles.highest.members.map(member => member.user.tag).join('\n');

        const pages = [
            new Discord.EmbedBuilder()
                .setTitle(`${message.guild.name} - Informações Gerais`)
                .addFields(
                    { name: ' ', value: ' ' },
                    { name: '<:descricaodotrabalho:1275839638631612487> Total de Membros', value: `${totalMembers}`, inline: true },
                    { name: '<:guia:1275650254384926781> Total de Canais', value: `${channels}`, inline: true },
                    { name: ' ', value: ' ' },
                    { name: '<:mudar:1275650265206493276> Membros Humanos', value: `${humans}`, inline: true },
                    { name: '<:voz:1278782283620421785> Canais de Voz', value: `${voiceChannels}`, inline: true },
                    { name: ' ', value: ' ' },
                    { name: '<:pesquisa:1275839827199398013> Bots', value: `${bots}`, inline: true },
                    { name: '<:avaliacao:1275831072554356918> Canais de Texto', value: `${textChannels}`, inline: true },
                    { name: ' ', value: ' ' },
                    { name: '<:homemdenegocios:1275652176437317653> Dono do Servidor', value: owner ? `<@${owner.id}>` : 'Desconhecido' }
                )
                .setColor(client.cor)
                .setThumbnail(message.guild.iconURL())
                .setFooter({ text: `Página 1 de ${2+roleChunks.length}` }),

            new Discord.EmbedBuilder()
                .setTitle(`${message.guild.name} - Lista de Cargos`)
                .addFields(
                    { name: "Maior cargo", value: `<@&${message.guild.roles.highest.id}>` },
                    { name: "Menor cargo", value: `${roles.first()}` },
                    { name: "Pessoas que ocupam o maior cargo", value: truncateText(membersWithHighestRole, 1024) },
                    { name: "Lista de cargos", value: roleChunks[0] || 'Nenhum cargo encontrado.' }
                )
                .setThumbnail(message.guild.iconURL())
                .setColor(client.cor)
                .setFooter({ text: `Página 2 de ${2+roleChunks.length}` }),

            ...roleChunks.slice(1).map((chunk, index) => 
                new Discord.EmbedBuilder()
                    .setTitle(`${message.guild.name} - Lista de Cargos (Continuação)`)
                    .addFields(
                        { name: "Lista de cargos", value: chunk }
                    )
                    .setThumbnail(message.guild.iconURL())
                    .setColor(client.cor)
                    .setFooter({ text: `Página ${index + 3} de ${roleChunks.length + 2}` })
            ),

            new Discord.EmbedBuilder()
                .setTitle(`${message.guild.name} - Informações do Dono`)
                .setDescription(owner ? `**Nome:** ${owner.user.tag}\n**ID:** ${owner.id}\n**Conta criada em:** ${ownerCreationDate}\n**Maior cargo:** <@&${ownerHighestRole.id}>` : 'Informações do dono não disponíveis.')
                .setColor(client.cor)
                .setThumbnail(owner ? owner.user.avatarURL() : message.guild.iconURL())
                .setFooter({ text: `Página ${roleChunks.length + 2} de ${roleChunks.length + 2}` })
        ];

        let currentPage = 0;

        const row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('prevPage')
                    .setLabel('◀️')
                    .setStyle(Discord.ButtonStyle.Primary)
                    .setDisabled(true),
                new Discord.ButtonBuilder()
                    .setCustomId('nextPage')
                    .setLabel('▶️')
                    .setStyle(Discord.ButtonStyle.Primary)
            );

        const msg = await message.channel.send({ embeds: [pages[currentPage]], components: [row] });
        const filter = (i) => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({filter,  time: 60000 });

        collector.on('collect', async interaction => {
            if (interaction.customId === 'nextPage') {
                currentPage++;
                if (currentPage >= pages.length) currentPage = pages.length - 1;
            } else if (interaction.customId === 'prevPage') {
                currentPage--;
                if (currentPage < 0) currentPage = 0;
            }

            await interaction.update({
                embeds: [pages[currentPage]],
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId('prevPage')
                                .setLabel('◀️')
                                .setStyle(Discord.ButtonStyle.Primary)
                                .setDisabled(currentPage === 0),
                            new Discord.ButtonBuilder()
                                .setCustomId('nextPage')
                                .setLabel('▶️')
                                .setStyle(Discord.ButtonStyle.Primary)
                                .setDisabled(currentPage === pages.length - 1)
                        )
                ]
            });
        });

        collector.on('end', () => {
            msg.edit({ components: [] });
        });
    } catch (error) {
        console.error('Error executing serverinfo command:', error);
        message.reply({content: 'Ocorreu um erro ao executar o comando.'});
    }
}

exports.help = {
    name: "serverinfo",
    aliases: ["infoserver", "si"],
    description: "Mostra informações sobre o servidor, com sistema de páginas. Usage: {prefixo}serverinfo",
    status: false
};
