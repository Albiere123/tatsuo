const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { translateText } = require("../../functions.js");

exports.run = async (client, message, args) => {
    
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    
    if (args.length < 2) {
        const erro = new EmbedBuilder();
        await client.setError(message, erro, "Por favor, forneça o tipo e o nome do anime ou mangá para buscar informações.");
        await client.setUsage(message, erro, `${client.prefix}info <anime | manga> <nome>`);
        return message.reply({ embeds: [erro] });
    }

    const type = args[0].toLowerCase();
    const query = args.slice(1).join(' ');

    
    if (type !== 'anime' && type !== 'manga') {
        const erro = new EmbedBuilder();
        await client.setError(message, erro, "Tipo inválido. Por favor, especifique `anime` ou `manga`.");
        await client.setUsage(message, erro, `${client.prefix}info <anime | manga> <nome>`);
        return message.reply({ embeds: [erro] });
    }

    try {
        
        const searchResponse = await fetch(`https://api.jikan.moe/v4/${type}?q=${encodeURIComponent(query)}&limit=1`);
        const searchData = await searchResponse.json();

        if (!searchData || !searchData.data || searchData.data.length === 0) {
            const erro = new EmbedBuilder();
            await client.setError(message, erro, `Nenhum resultado encontrado para "${query}".`);
            await client.setUsage(message, erro, `${client.prefix}info <anime | manga> <nome>`);
            return message.reply({ embeds: [erro] });
        }

        const item = searchData.data[0];

        
        const synopsis = item.synopsis ? await translateText(item.synopsis, "pt") : 'Sinopse não disponível.';
        const title = item.title || 'Título não disponível';
        const imageUrl = item.images?.jpg?.large_image_url || null;
        const url = item.url || null;
        const score = item.score ? item.score.toString() : 'N/A';
        const episodesOrChapters = type === 'anime' ? item.episodes : item.chapters;
        const countLabel = type === 'anime' ? 'Episódios' : 'Capítulos';
        const count = episodesOrChapters ? episodesOrChapters.toString() : 'N/A';
        const status = item.status ? await translateText(item.status, "pt") : 'N/A';
        const releaseDate = item.aired?.string || item.published?.string || 'N/A';

        
        const generalInfoEmbed = new EmbedBuilder()
            .setColor(client.cor)
            .setThumbnail(imageUrl)
 .setDescription(`# **[<:imagem1:1275650286899167325> ${title}](${item.url})**\nㅤ\n${synopsis}\nㅤ`)
            .addFields(
                { name: '<:descricaodotrabalho:1275839638631612487> Tipo', value: capitalizeFirstLetter(type), inline: true },
                { name: '<:medalhaestrela:1275833855600885844> Pontuação', value: score, inline: true },
                { name: `<:avaliacao:1275831072554356918> ${countLabel}`, value: count, inline: true },
                { name: '<:midiasocial:1275650307858108561> Status', value: status, inline: true },
                { name: '<:pesquisa:1275839827199398013> Lançamento', value: releaseDate, inline: true }
            )

        const embeds = [generalInfoEmbed];

        
        if (type === 'anime') {
            const charactersResponse = await fetch(`https://api.jikan.moe/v4/anime/${item.mal_id}/characters`);
            const charactersData = await charactersResponse.json();

            if (charactersData && charactersData.data && charactersData.data.length > 0) {
                const seiyuuEmbeds = charactersData.data
                    .filter(char => char.voice_actors && char.voice_actors.length > 0)
                    .slice(0, 10)
                    .map(char => {
                        const seiyuu = char.voice_actors[0];
                        return new EmbedBuilder()
                            .setColor(client.cor || '#0099ff')
                            .setTitle(`🎭 ${char.character.name}`)
                            .setURL(char.character.url)
                            .setThumbnail(seiyuu.person.images.jpg.image_url)
                            .setDescription(`**Dublador:** [${seiyuu.person.name}](${seiyuu.person.url})\n**Idioma:** ${seiyuu.language}`)
                            .setImage(char.character.images.jpg.image_url)
                            .setFooter({ text: `Solicitado por ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) });
                    });

                if (seiyuuEmbeds.length > 0) {
                    embeds.push(...seiyuuEmbeds);
                }
            }
        }

        
        let currentPage = 0;
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('⬅️ Anterior')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Próximo ➡️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(embeds.length === 1)
        );

        const messageReply = await message.reply({ embeds: [embeds[currentPage]], components: [buttons] });

        if (embeds.length > 1) {
            const collector = messageReply.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 120000,
            });

            collector.on('collect', async interaction => {
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({ content: 'Você não pode usar esses botões.', ephemeral: true });
                }

                if (interaction.customId === 'prev') {
                    currentPage--;
                } else if (interaction.customId === 'next') {
                    currentPage++;
                }

                
                buttons.components[0].setDisabled(currentPage === 0);
                buttons.components[1].setDisabled(currentPage === embeds.length - 1);

                await interaction.update({ embeds: [embeds[currentPage]], components: [buttons] });
            });

            collector.on('end', () => {
                buttons.components.forEach(button => button.setDisabled(true));
                messageReply.edit({ components: [buttons] });
            });
        }

    } catch (error) {
        console.error('Erro ao buscar informações:', error);
        const erro = new EmbedBuilder();
        await client.setError(message, erro, "Ocorreu um erro ao tentar buscar as informações. Por favor, tente novamente mais tarde.");
        await client.setUsage(message, erro, `${client.prefix}info <anime | manga> <nome>`);
        return message.reply({ embeds: [erro] });
    }
};

exports.help = {
    name: 'info',
    aliases: ['mangainfo', 'animeinfo'],
    description: 'Busca informações sobre um anime ou mangá específico. Uso: {prefixo}info <anime | manga> <nome>',
    status: true
};


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
