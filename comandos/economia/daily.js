const Discord = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const api = require('yuuta-functions')
exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if(message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"});
    const userId = message.author.id;
    const minReward = 2000;
    const maxReward = 2500;
    const reward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
    const now = new Date();

    
    const lastClaim = await db.get(`daily_${userId}`);
    if (lastClaim) {
        const lastClaimDate = new Date(lastClaim);
        const timeDiff = now - lastClaimDate;
        const hoursPassed = timeDiff / (1000 * 60 * 60);

        if (hoursPassed < 24 && message.author.id != client.dev.id) {
            const remainingTime = Math.ceil(24 - hoursPassed);
            return message.reply(`Você já reivindicou sua recompensa diária hoje. Tente novamente em ${remainingTime} horas.`);
        }
    }

   
    try {
        const user = await db.get(userId) || { money: 0, sb: null, trabalho: null, investimentos: null};
        user.money += reward;
        await db.set(userId, user);

        
        await db.set(`daily_${userId}`, now.toISOString());

        
        const embed = new Discord.EmbedBuilder()
            .setColor(client.cor)
            .setDescription(`# <:salario:1275832601931939984> Daily
ㅤ
**<:dinheiro:1275650298005950494> Quanto ganhou:** R$${api.ab(reward)}
ㅤ
**<:cartaodecredito:1275832591894970450> Saldo atual:** R$${api.ab(Number(user.money.toFixed(0)))}`)
            .setThumbnail(message.author.avatarURL({size: 2048, extension: "png"}))
        await message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error updating balance:', error);
        await message.reply('Ocorreu um erro ao tentar atualizar seu saldo. Tente novamente mais tarde.');
    }
};

exports.help = {
    name: 'daily',
    aliases: ['diario'],
    description: 'Reclame sua recompensa diária com um embed. Usage: {prefixo}daily',
    status: false
};
