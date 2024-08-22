const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async(client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if(message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"});
    
    
    const buttonStreamer = new Discord.ButtonBuilder()
        .setCustomId('select_streamer')
        .setLabel('Streamer')
        .setStyle(Discord.ButtonStyle.Primary);
    
    const buttonCLT = new Discord.ButtonBuilder()
        .setCustomId('select_clt')
        .setLabel('CLT')
        .setStyle(Discord.ButtonStyle.Primary);

    const row = new Discord.ActionRowBuilder().addComponents(buttonStreamer, buttonCLT);

    const embed = new Discord.EmbedBuilder()
        .setColor(client.cor)
        .setDescription(`# <:transferenciadedados:1275650263511994409> Empregos
ㅤ
<:lista:1275656990013526076>  Lista de empregos:
- Streamer;
- CLT`)
        .setThumbnail('https://cdn-icons-png.flaticon.com/512/1995/1995574.png'); 
    
    const msg = await message.reply({ embeds: [embed], components: [row] });

    const filter = i => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
    const userData = (await db.get(`${message.author.id}`))
    collector.on('collect', async i => {
        if (i.customId === 'select_streamer') {
            await db.set(`${i.user.id}`, {
                money: userData.money,
                sb: userData.sb,
                trabalho: "Streamer"
            });
            await i.update({ content: 'Você escolheu o emprego de **Streamer**!', embeds: [], components: [] });
        } else if (i.customId === 'select_clt') {
            await db.set(`${i.user.id}`, {
                money: userData.money,
                sb: userData.sb,
                trabalho: "CLT"
            });
            await i.update({ content: 'Você escolheu o emprego de **CLT**!', embeds: [], components: [] });
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
