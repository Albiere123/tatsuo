const Discord = require('discord.js');
const { QuickDB } = require('quick.db');
const Canvas = require('canvas');
const db = new QuickDB();
const api = require('yuuta-functions');

const formatDate = (date) => {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('pt-BR', options).format(date);
};

async function getUserRank(userId, id) {
    const users = await db.all();

    const userBalances = users
        .filter(f => !isNaN(f.value.money) && f.id !== id)
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
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    let mentionedUser = message.mentions.users.first() || client.users.cache.get(args[0]);

    if (!mentionedUser && args.length > 0) {
        const usernameOrDisplayName = args.join(' ');
        mentionedUser = client.users.cache.find(u => u.username.toLowerCase() === usernameOrDisplayName.toLowerCase() || `${u.username.toLowerCase()}#${u.discriminator}` === usernameOrDisplayName.toLowerCase());
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

    const userRank = await getUserRank(mentionedUser.id, client.dev.id);
    let rankText = userRank.rank === "Não encontrado" ? "0" : userRank.rank;
    const totalUsers = userRank.totalUsers || 0;
    const rankDescription = client.dev.id != mentionedUser.id ? `Nº ${rankText} no ranking de ${totalUsers}`: "O DEV não participa do rank!";

    const user = await db.get(mentionedUser.id);

    let sbText = message.author.id === client.dev.id && user?.sb ? user.sb : 'Não definido';
    const emojiImages = [];

    if (sbText) {
        const emojiMatches = sbText.match(/{emoji:(\d+)}/g);
        if (emojiMatches) {
            for (let match of emojiMatches) {
                const emojiId = match.match(/\d+/)[0];
                const emoji = client.emojis.cache.get(emojiId);
                if (emoji) {
                    const emojiImage = await Canvas.loadImage(emoji.url);
                    emojiImages.push({ match, image: emojiImage });
                    sbText = sbText.replace(match, `{image}`);
                }
            }
        }
    }

    const userInfo = {
        'Usuário': mentionedUser.username,
        'Trabalho': user?.trabalho || 'Não definido',
        'Dinheiro': api.ab(user?.money.toFixed(2)) || 0,
        'Data de Criação': formatDate(mentionedUser.createdAt),
        'Descrição': sbText.replaceAll("{bot}", client.user.username),
        'Posição no Rank': rankDescription
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

    const boxHeight = 50;
    const boxWidth = 185;
    const boxMargin = 10;

    
    drawRoundedRect(50, 200, boxWidth, boxHeight, 15);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Usuário: ${userInfo['Usuário']}`, 60, 230);

    drawRoundedRect(265, 200, boxWidth, boxHeight, 15);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Trabalho: ${userInfo['Trabalho']}`, 275, 230);

    
    let yOffset = 200 + boxHeight + boxMargin;

    drawRoundedRect(50, yOffset, 400, boxHeight, 15);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Dinheiro: ${userInfo['Dinheiro']}`, 60, yOffset + 30);

    yOffset += boxHeight + boxMargin;

    
    drawRoundedRect(50, yOffset, 400, boxHeight, 15);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Data de Criação: ${userInfo['Data de Criação']}`, 60, yOffset + 30);

    yOffset += boxHeight + boxMargin;

    
    const descriptionBoxHeight = boxHeight; 

    
    drawRoundedRect(50, yOffset, 400, descriptionBoxHeight, 15); 
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Descrição:`, 60, yOffset + 30);

    let textX = 60 + 90;
    let textY = yOffset + 30; 

    const maxWidth = 400 - 20; 

    if (emojiImages.length > 0) {
        const parts = userInfo['Descrição'].split('{image}');
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part) {
                ctx.fillText(part, textX, textY+1);
                textX += ctx.measureText(part).width;
            }
            
            if (i < emojiImages.length) {
                const emojiImage = emojiImages[i].image;
                const emojiSize = 25; 
                ctx.drawImage(emojiImage, textX, textY - 16, emojiSize, emojiSize);
                textX += emojiSize + 5; 
            }

            if (textX > maxWidth) {
                textX = 60;
                ctx.fillText('', textX, textY); 
            }
        }
    } else {
        ctx.fillText(userInfo['Descrição'], 150, textY);
    }

    
    yOffset = textY + boxHeight + boxMargin;
    for (const [label, value] of Object.entries(userInfo).slice(4)) {
        if(label == "Descrição") continue;
        drawRoundedRect(50, yOffset - 30, 400, boxHeight, 15);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`${label}: ${value}`, 60, yOffset);
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
    status: false
};
