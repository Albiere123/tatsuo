const Discord = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const status = true;
const api = require("yuuta-functions")
exports.run = async (client, message, args) => {
    // Obtém todos os usuários e suas moedas
    const users = await db.all();

    // Filtra apenas os usuários com saldo de moedas
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
    if(f[0] == "Usuário não encontrado!") description = `# <:cash2:975513628046393485> | Ranking Global\nㅤ\nNenhum usuário encontrado.`
    else description = `# <:cash2:975513628046393485> | Ranking Global
ㅤ
1º  ${f[0]}
2º  ${f[1]}
3º  ${f[2]}
4º  ${f[3]}
5º  ${f[4]}
6º  ${f[5]}
7º  ${f[6]} 
8º  ${f[7]}
9º  ${f[8]}
10º ${f[9]}`
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
    status: status
};
