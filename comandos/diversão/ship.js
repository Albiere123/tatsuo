const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const Canvas = require('canvas');
const config = require('../../config.json');
const db = new QuickDB();
exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;

    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    const erro = new EmbedBuilder();
    const mentioned1 = message.mentions.users.first();
  
    if (args[0]) {
        
        let user1;
        let user2;

        user1 = mentioned1
        const userId = args[0].replace(/[^\d]/g, ''); 
        if (!user1 && userId) {
            user1 = await client.users.fetch(userId).catch(() => null);
        }


        if (!user1) {
            user1 = client.users.cache.find(user => user.username.toLowerCase() === args[0].toLowerCase());
        }

        if (!user1) {
            client.setError(erro, "Não encontrei o usuário especificado!");
            client.setUsage(erro, `${config.prefix}ship <ID/nome> [ID/nome]`);
            erro.setColor(client.cor);
            erro.setThumbnail(client.user.displayAvatarURL());
            return message.reply({ embeds: [erro] });
        }

        if (args[1]) {
            
            const userId2 = args[1].replace(/[^\d]/g, ''); 
            if (userId2) {
                user2 = await client.users.fetch(userId2).catch(() => null);
            }

            
            if (!user2) {
                user2 = client.users.cache.find(user => user.username.toLowerCase() === args[1].toLowerCase());
            }
        } else {
            user2 = message.author;
        }

        if (!user2) {
            client.setError(erro, "Não encontrei o segundo usuário especificado!");
            client.setUsage(erro, `${config.prefix}ship <usuário> [usuário]`);
            erro.setColor(client.cor);
            erro.setThumbnail(client.user.displayAvatarURL());
            return message.reply({ embeds: [erro] });
        }

        const generateShipName = (name1, name2) => {
            const halfLength1 = Math.ceil(name1.length / 2);
            const halfLength2 = Math.ceil(name2.length / 2);
            const firstPart = name1.slice(0, halfLength1);
            const secondPart = name2.slice(halfLength2);
            return `${firstPart}${secondPart}`;
        };

        const avatar1 = user1.displayAvatarURL({ extension: "png", size: 256 });
        const avatar2 = user2.displayAvatarURL({ extension: "png", size: 256 });

        const canvas = Canvas.createCanvas(800, 400);
        const ctx = canvas.getContext('2d');

        const img1 = await Canvas.loadImage(avatar1);
        const img2 = await Canvas.loadImage(avatar2);

        ctx.drawImage(img1, 50, 50, 300, 300);
        ctx.drawImage(img2, 450, 50, 300, 300);

        let compatibility = await db.get(`ship_${user1.id}_${user2.id}`);
        if (compatibility === null) {
            compatibility = Math.floor(Math.random() * 100);
            await db.set(`ship_${user1.id}_${user2.id}`, compatibility);
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(50, 370, 700, 20);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(50, 370, (700 * compatibility) / 100, 20);

        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#000000';
        ctx.fillText(`${compatibility}%`, 375, 390);

        const shipName = generateShipName(user1.username, user2.username);

        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'ship-image.png' });
        const embed = new EmbedBuilder()
            .setDescription(`# <:love:1268992145436708904> | Ship
ㅤ
( <:users:1268992440237428937> ) ${user1.username} ❤️ ${user2.username}\n( <:mmm:1268992704998805524> ) Nome do Ship: **${shipName}**`)
            .setImage('attachment://ship-image.png')
            .setColor(client.cor);

        message.channel.send({
            embeds: [embed],
            files: [attachment],
        });
    } else {
        client.setError(erro, "Insira o nome, menção ou id de alguém");
        client.setUsage(erro, `${config.prefix}ship <usuário> [usuário]`);
        erro.setColor(client.cor);
        erro.setThumbnail(client.user.displayAvatarURL());
        return message.reply({ embeds: [erro] });
    }
};

exports.help = {
    name: 'ship',
    aliases: ['shipar'],
    description: 'Veja se um ship seu seria real! Usage: {prefixo}ship <user1> [user2]',
    status: false
};
