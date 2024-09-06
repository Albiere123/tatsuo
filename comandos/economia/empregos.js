const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    let userData = await db.get(message.author.id) || { money: 0, sb: "Não definido", trabalho: null, investimentos: null };

    if (userData.trabalho !== null) {
        const msg = await message.reply({ content: "Parece que você já possui um trabalho. Caso queira se demitir, digite \"sim\" em até 1 minuto!" });
        const filter = m => m.author.id === message.author.id && ['sim'].includes(m.content.toLowerCase());

        message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] })
            .then(async collected => {
                const response = collected.first().content.toLowerCase();

                if (response === 'sim') {

                    await db.set(message.author.id, {
                        money: userData.money,
                        sb: userData.sb,
                        trabalho: null,
                        investimentos: userData?.investimentos || null
                    });
                    return message.reply({ content: "Você se demitiu do trabalho." });
                }
            })
            .catch(() => {
                message.reply({ content: "Tempo esgotado. Parece que desistiu de se demitir." });
            });

        return;
    }

    const buttonStreamer = new Discord.ButtonBuilder()
        .setCustomId('select_streamer')
        .setLabel('Streamer')
        .setStyle(Discord.ButtonStyle.Primary);

    const buttonCLT = new Discord.ButtonBuilder()
        .setCustomId('select_clt')
        .setLabel('CLT')
        .setStyle(Discord.ButtonStyle.Primary);
    
    const buttonES = new Discord.ButtonBuilder()
        .setCustomId('select_es')
        .setLabel('Engenheiro de Software')
        .setStyle(Discord.ButtonStyle.Primary);

    const row = new Discord.ActionRowBuilder().addComponents(buttonStreamer, buttonCLT, buttonES);

    const embed = new Discord.EmbedBuilder()
        .setColor(client.cor)
        .setDescription(`# <:transferenciadedados:1275650263511994409> Empregos
ㅤ
<:lista:1275656990013526076>  Lista de empregos:
- Streamer;
- CLT
- Engenheiro de Softwer`)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/1995/1995574.png');

    const msg = await message.reply({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        if (i.customId === 'select_streamer') {
            await db.set(message.author.id, {
                money: userData.money || 0,
                sb: userData.sb || "Não definido.",
                trabalho: "Streamer",
                investimentos: userData.investimentos || null
            });
            await i.update({ content: 'Você escolheu o emprego de **Streamer**!', embeds: [], components: [] });
        } else if (i.customId === 'select_clt') {
            await db.set(message.author.id, {
                money: userData.money || 0,
                sb: userData.sb || "Não definido.",
                trabalho: "CLT",
                investimentos: userData.investimentos || null
            });
            await i.update({ content: 'Você escolheu o emprego de **CLT**!', embeds: [], components: [] });
        } else if (i.customId === "select_es") {
            await db.set(message.author.id, {
                money: userData.money || 0,
                sb: userData.sb || "Não definido.",
                trabalho: "Engenheiro de Software",
                investimentos: userData.investimentos || null
            });
            await i.update({ content: 'Você escolheu o emprego de **Engenheiro de Software**!', embeds: [], components: [] });
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
    description: "Selecione o seu emprego entre Streamer e CLT. Usage: {prefixo}emprego",
    status: false
}
