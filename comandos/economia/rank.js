const Discord = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    const global = new Discord.ButtonBuilder()
        .setCustomId('global')
        .setLabel('Ranking Global')
        .setStyle(Discord.ButtonStyle.Primary);

    const quiz = new Discord.ButtonBuilder()
        .setCustomId('quiz')
        .setLabel("Ranking Quiz")
        .setStyle(Discord.ButtonStyle.Primary);

    const row = new Discord.ActionRowBuilder().addComponents(global, quiz);

    let main = new Discord.EmbedBuilder()
        .setDescription(`# <:rankingdapagina:1275833853419716699> Menu de Rankings
Escolha entre as categorias:
    - <:medalhaestrela:1275833855600885844> Ranking Global -> Ranking global do bot;
- <:medalhaestrela:1275833855600885844> Ranking Quiz -> Ranking do Quiz no servidor.`)
        .setThumbnail("https://cdn-icons-png.flaticon.com/128/4614/4614388.png")
        .setColor(client.cor);

    const msg = await message.channel.send({ embeds: [main], components: [row] });

    const filter = i => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on("collect", async col => {
        const id = col.customId;

        if (id === "global") {
            const users = await db.all();
            const userBalances = users
                .filter(f => !isNaN(f.value.money) && f.id != client.dev.id)
                .map(entry => ({
                    userId: entry.id,
                    money: entry.value.money,
                }))
                .sort((a, b) => b.money - a.money);

            const pageSize = 10; 
            const pages = Math.ceil(userBalances.length / pageSize);

            let currentPage = 0;

            const generatePage = (page) => {
                const start = page * pageSize;
                const end = start + pageSize;
                const pageData = userBalances.slice(start, end);

                const description = pageData.map((user, index) => {
                    const userName = client.users.cache.get(user.userId)?.username || "Usuário desconhecido";
                    const position = start + index + 1; 
                    if (index === 0) return `<:medalhadeouro:1275833851536736367> ${userName} - **R$ ${user.money}**`;
                    if (index === 1) return `<:medalhadeprata:1275833849410228264> ${userName} - **R$ ${user.money}**`;
                    if (index === 2) return `<:medalhadebronze:1275833846503575586> ${userName} - **R$ ${user.money}**`;
                    return `<:medalhaestrela:1275833855600885844> ${position}. ${userName} - **R$ ${user.money}**`;
                }).join('\n');

                return new Discord.EmbedBuilder()
                    .setColor(client.cor)
                    .setDescription(`# <:rankingdapagina:1275833853419716699> Ranking Global - Página ${page + 1}/${pages}\n${description}`)
                    .setFooter({ text: 'Atualizado a cada vez que o comando é executado.' })
                    .setThumbnail(client.user.avatarURL({ size: 2048 }));
            };

            const prevButton = new Discord.ButtonBuilder()
                .setCustomId('prev')
                .setLabel('⬅️')
                .setStyle(Discord.ButtonStyle.Secondary)
                .setDisabled(currentPage === 0);

            const nextButton = new Discord.ButtonBuilder()
                .setCustomId('next')
                .setLabel('➡️')
                .setStyle(Discord.ButtonStyle.Secondary)
                .setDisabled(currentPage === pages - 1);

            const buttonRow = new Discord.ActionRowBuilder().addComponents(prevButton, nextButton);

            const embed = generatePage(currentPage);
            const msgSent = await col.update({ embeds: [embed], components: [buttonRow] });

            const pageFilter = i => i.user.id === message.author.id;
            const pageCollector = msgSent.createMessageComponentCollector({ filter: pageFilter, time: 60000 });

            pageCollector.on('collect', async (i) => {
                if (i.customId === 'prev' && currentPage > 0) {
                    currentPage--;
                } else if (i.customId === 'next' && currentPage < pages - 1) {
                    currentPage++;
                }

                prevButton.setDisabled(currentPage === 0);
                nextButton.setDisabled(currentPage === pages - 1);

                const newEmbed = generatePage(currentPage);
                await i.update({ embeds: [newEmbed], components: [buttonRow] });
            });

        } else if (id === "quiz") {
            
            const guildId = message.guild.id;
            const localScores = await db.get(`triviaLocalScores_${guildId}`) || {};
            
            const sortedScores = Object.values(localScores)
                .sort((a, b) => b.score - a.score)
                .map((user, index) => {
                    const userName = user.name || "Usuário desconhecido";
                    if (index === 0) return `<:medalhadeouro:1275833851536736367> ${userName} - **${user.score}** Pontos`;
                    if (index === 1) return `<:medalhadeprata:1275833849410228264> ${userName} - **${user.score}** Pontos`;
                    if (index === 2) return `<:medalhadebronze:1275833846503575586> ${userName} - **${user.score}** Pontos`;
                    return `<:medalhaestrela:1275833855600885844> ${userName} - **${user.score}** Pontos`;
                }).join('\n');

            const description = sortedScores.length > 0 ? sortedScores : 'Nenhum resultado disponível.';
            const embed = new Discord.EmbedBuilder()
                .setColor(client.cor)
                .setDescription(`# <:rankingdapagina:1275833853419716699> Ranking Quiz\n${description}`)
                .setThumbnail("https://cdn-icons-png.flaticon.com/512/7128/7128236.png")
                .setFooter({ text: 'Atualizado a cada vez que o comando é executado.' });

            await col.update({ embeds: [embed], components: [row] });
        }
    });
};

exports.help = {
    name: 'rank',
    aliases: ['ranking'],
    description: 'Mostra o ranking dos usuários com base nas moedas ou no quiz. Usage: {prefixo}rank',
    status: false
};
