const Discord = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const api = require("yuuta-functions")
exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;

    const users = await db.all();

    
    const userBalances = users
        .filter(f => !isNaN(f.value.money)&&f.id!=client.dev.id)
        .map(entry => ({
            userId: entry.id,
            money: entry.value.money,
        }))
        .sort((a, b) => b.money - a.money); 

    
    const rankList = [];
    await userBalances.forEach((user) => 
        rankList.push(`${client.users.cache.get(user.userId).username} - R$ ${api.ab(user.money)}`))
    let f = [];
    for(let i = 0;i<=10;i++) {
        if(rankList[i]) f.push(rankList[i]);
        else f.push("Usuário não encontrado!") 
    }
    let description = ``;
    if(f[0] == "Usuário não encontrado!") description = `# <:rankingdapagina:1275833853419716699> Ranking Global\nㅤ\nNenhum usuário encontrado.`
    else description = `# <:rankingdapagina:1275833853419716699> Ranking Global
ㅤ
<:medalhadeouro:1275833851536736367>  ${f[0]}
<:medalhadeprata:1275833849410228264>  ${f[1]}
<:medalhadebronze:1275833846503575586>  ${f[2]}
<:medalhaestrela:1275833855600885844>  ${f[3]}
<:medalhaestrela:1275833855600885844>  ${f[4]}
<:medalhaestrela:1275833855600885844>  ${f[5]}
<:medalhaestrela:1275833855600885844>  ${f[6]} 
<:medalhaestrela:1275833855600885844>  ${f[7]}
<:medalhaestrela:1275833855600885844>  ${f[8]}
<:medalhaestrela:1275833855600885844>  ${f[9]}`
    const embed = new Discord.EmbedBuilder()
        .setColor(client.cor) 
        .setDescription(description)
        .setFooter({ text: 'Atualizado a cada vez que o comando é executado.' })
        .setThumbnail(client.user.avatarURL({size: 2048}))
    await message.reply({ embeds: [embed] });
};




exports.help = {
    name: 'rank',
    aliases: ['ranking'],
    description: 'Mostre o ranking dos usuários com base nas moedas. Usage: {prefixo}rank',
    status: false
};
