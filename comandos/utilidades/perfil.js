const Discord = require('discord.js');
const { QuickDB } = require('quick.db');
const Canvas = require('canvas');
const db = new QuickDB();
const status = true;
const api = require('yuuta-functions')
const formatDate = (date) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('pt-BR', options).format(date);
};

async function getUserRank(userId, id) {
   
    const users = await db.all();

    
    const userBalances = users
        .filter(f => !isNaN(f.value.money)&&f.id!=id)
        .map(entry => ({
            userId: entry.id,
            money: entry.value.money,
        }))
        .sort((a, b) => b.money - a.money); 

    
    const rank = userBalances.findIndex(user => user.userId === userId);

    if (rank === -1) {
        return { rank: 'Não encontrado', money: 0 };
    }

    return {
        rank: rank + 1,
        money: userBalances[rank].money,
        totalUsers: userBalances.length
    };
}

exports.run = async (client, message, args) => {
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    let mentionedUser = message.mentions.users.first() || client.users.cache.get(args[0]);

    if (!mentionedUser && args.length > 0) {
        const usernameOrDisplayName = args.join(' ');
        let user = client.users.cache.find(u => u.username.toLowerCase() === usernameOrDisplayName.toLowerCase() || `${u.username.toLowerCase()}#${u.discriminator}` === usernameOrDisplayName.toLowerCase());
        mentionedUser = user;
    }

    if (!mentionedUser) mentionedUser = message.author;

    const backgroundUrl = await db.get(`background_${mentionedUser.id}`) || client.user.displayAvatarURL({ size: 2048, extension: 'png' });

    const canvas = Canvas.createCanvas(500, 500);
    const ctx = canvas.getContext('2d');

    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';

    const background = await Canvas.loadImage(backgroundUrl);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avatar = await Canvas.loadImage(mentionedUser.displayAvatarURL({ extension: 'png', size: 128 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(250, 120, 60, 0, Math.PI * 2, true);
    ctx.clip();
    ctx.drawImage(avatar, 190, 60, 120, 120);
    ctx.restore();
    let rank = ``;
    if(mentionedUser.id == client.dev.id) rank = "O DEV não participa no rank!"
    else rank = `Nº ${(await getUserRank(mentionedUser.id, client.dev.id)).rank == "Não encontrado" ? "0": `${(await getUserRank(mentionedUser.id, client.dev.id)).rank}`} no ranking de ${(await getUserRank(mentionedUser.id, client.dev.id)).totalUsers || 0}` || 'Ainda não possue rank.'
    const user = await db.get(mentionedUser.id)
    const userInfo = {
        'Usuário': mentionedUser.username,
        'Dinheiro': api.ab(user?.money) || 0,
        'Data de Criação': formatDate(mentionedUser.createdAt),
        'Descrição': user?.sb || 'Não definido',
        'Posição no Rank': rank || "0"
    };

    const drawRoundedRect = (x, y, width, height, radius) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2);
        ctx.lineTo(x + radius, y + height);
        ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI);
        ctx.lineTo(x, y + radius);
        ctx.arc(x + radius, y + radius, radius, Math.PI, -Math.PI / 2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    let yOffset = 200;
    const boxHeight = 50;
    const boxWidth = 400;
    const boxMargin = 10;
    for (const [label, value] of Object.entries(userInfo)) {
        drawRoundedRect(50, yOffset, boxWidth, boxHeight, 15);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${label}: ${value}`, 60, yOffset + 30);
        yOffset += boxHeight + boxMargin;
    }

    const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), { name: 'profile-image.png' });
    const embed = new Discord.EmbedBuilder()
        .setDescription(`# <:cracha:820694021487460352> | Perfil de ${mentionedUser.username}`)
        .setImage('attachment://profile-image.png')
        .setColor(client.cor);

    message.channel.send({
        embeds: [embed],
        files: [attachment],
    });
};

exports.help = {
    name: 'perfil',
    aliases: ['profile', 'p'],
    description: 'Gera uma imagem de perfil personalizada de um usuário. Usage: {prefixo}perfil [user]',
    status: status
};
