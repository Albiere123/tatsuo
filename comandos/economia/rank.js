const Discord = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const api = require("yuuta-functions")
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
        .setStyle(Discord.ButtonStyle.Primary)
    const row = new Discord.ActionRowBuilder().addComponents(global, quiz);


    let main = new Discord.EmbedBuilder()
    .setDescription(`# Menu de Ranking's
Escolha entre as categorias:
    - Ranking Global -> Ranking global do bot;
    - Ranking Quiz -> Ranking do Quiz no servidor.`)
    .setColor(client.cor)
    const msg = await message.channel.send({embeds: [main], components: [row]})
    const filter = i => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });
    collector.on("collect", async col => {
        id = await col.customId;
        if(id == "global") {
    const users = await db.all();

    
    const userBalances = users
        .filter(f => !isNaN(f.value.money)&&f.id!=client.dev.id)
        .map(entry => ({
            userId: entry.id,
            money: entry.value.money,
        }))
        .sort((a, b) => b.money - a.money); 

        const sortedScores = Object.values(userBalances)
        .sort((a, b) => b.score - a.score)
        .map((user, index) => {
            user.name = client.users.cache.get(user.userId).username
            if (index == 0) return `<:medalhadeouro:1275833851536736367> ${user.name} - **R$ ${user.money}**`;
            else if (index == 1) return `<:medalhadeprata:1275833849410228264>  ${user.name} - **R$ ${user.money}**`;
            else if (index == 2) return `<:medalhadebronze:1275833846503575586> ${user.name} - **R$ ${user.money}**`;
            else return `<:medalhaestrela:1275833855600885844> ${user.name} - **R$ ${user.money}**`;
        })
        .join('\n');

    let description = `# <:rankingdapagina:1275833853419716699> Ranking Global\n
${sortedScores.length > 0 ? sortedScores : 'Nenhum resultado disponível.'}`
    const embed = new Discord.EmbedBuilder()
        .setColor(client.cor) 
        .setDescription(description)
        .setFooter({ text: 'Atualizado a cada vez que o comando é executado.' })
        .setThumbnail(client.user.avatarURL({size: 2048}))
    await col.update({ embeds: [embed], components: [row] });
        }else if (id == "quiz") {



    const guildId = message.guild.id;

    
    const localScores = await db.get(`triviaLocalScores_${guildId}`) || {};

   
    const sortedScores = Object.values(localScores)
        .sort((a, b) => b.score - a.score)
        .map((user, index) => {
            if (index == 0) return `<:medalhadeouro:1275833851536736367> ${user.name} - **${user.score}** Pontos`;
            else if (index == 1) return `<:medalhadeprata:1275833849410228264>  ${user.name} - **${user.score}** Pontos`;
            else if (index == 2) return `<:medalhadebronze:1275833846503575586> ${user.name} - **${user.score}** Pontos`;
            else return `<:medalhaestrela:1275833855600885844> ${index + 1}. ${user.name} - **${user.score}** Pontos`;
        })
        .join('\n');

    
    const embed = new Discord.EmbedBuilder()
        .setColor(client.cor)
        .setDescription(`# <:rankingdapagina:1275833853419716699> Ranking Quiz\n${sortedScores.length > 0 ? sortedScores : 'Nenhum resultado disponível.'}`)
        .setThumbnail("https://cdn-icons-png.flaticon.com/512/7128/7128236.png")
        .setFooter({ text: 'Atualizado a cada vez que o comando é executado.' })
    
    await col.update({ embeds: [embed], components: [row] });
}
    })
}




exports.help = {
    name: 'rank',
    aliases: ['ranking'],
    description: 'Mostre o ranking dos usuários com base nas moedas. Usage: {prefixo}rank',
    status: false
};
