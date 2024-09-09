const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = await db.get(`${this.help.name}_privado`) || false;
    if (message.author.id !== client.dev.id && !status) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    let userData = await db.get(message.author.id) || { money: 0, sb: "Não definido", trabalho: null, investimentos: null };

    if (userData.trabalho) {
        return message.reply({ content: "Parece que você já possui um trabalho. Caso queira se demitir, digite \"sim\" em até 1 minuto!" })
            .then(msg => {
                message.channel.awaitMessages({
                    filter: m => m.author.id === message.author.id && m.content.toLowerCase() === 'sim', max: 1, time: 60000, errors: ['time']}).then(async () => {
                    await db.set(message.author.id, {
                        ...userData,
                        trabalho: null
                    });
                    msg.reply({ content: "Você se demitiu do trabalho." });
                }).catch(() => {
                    msg.reply({ content: "Tempo esgotado. Parece que desistiu de se demitir." });
                });
            });
    }

    const jobs = [
        { id: 'select_streamer', emoji: '<:streamer:1282154650174361641>', name: 'Streamer' },
        { id: 'select_clt', emoji: '<:clt:1282154639386607707>', name: 'CLT' },
        { id: 'select_es', emoji: '<:engenheirodesoftware:1282154615055585280>', name: 'Engenheiro de Software' }
    ];

    const buttons = jobs.map(job => 
        new Discord.ButtonBuilder()
            .setCustomId(job.id)
            .setEmoji(job.emoji)
            .setStyle(Discord.ButtonStyle.Primary)
    );

    const row = new Discord.ActionRowBuilder().addComponents(buttons);

    const embed = new Discord.EmbedBuilder()
        .setColor(client.cor)
        .setDescription(`# <:transferenciadedados:1275650263511994409> Empregos
        ㅤ
        <:lista:1275656990013526076>  Lista de empregos:
- <:streamer:1282154650174361641> Streamer
- <:clt:1282154639386607707> CLT
- <:engenheirodesoftware:1282154615055585280> Engenheiro de Software`)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/1995/1995574.png');

    const msg = await message.reply({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        const selectedJob = jobs.find(job => job.id === i.customId);

        if (selectedJob) {
            await db.set(message.author.id, {
                ...userData,
                trabalho: selectedJob.name
            });
            await i.update({ content: `Você escolheu o emprego de **${selectedJob.name}**!`, embeds: [], components: [] });
        }
    });

    collector.on('end', collected => {
        if (collected.size === 0) {
            msg.edit({ content: 'Você não selecionou nenhum emprego a tempo.', embeds: [], components: [] });
        }
    });
}

exports.help = {
    name: "empregos",
    aliases: ["job"],
    description: "Selecione o seu emprego entre Streamer, CLT ou Engenheiro de Software. Usage: {prefixo}emprego",
    status: false
}
