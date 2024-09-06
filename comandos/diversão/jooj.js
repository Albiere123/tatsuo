const { AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    let user = message.mentions.users.first() || client.users.cache.get(args[0]);

    if (!user && args.length > 0) {
        const usernameOrDisplayName = args.join(' ');
        user = client.users.cache.find(u => u.username.toLowerCase() === usernameOrDisplayName.toLowerCase() || `${u.username.toLowerCase()}#${u.discriminator}` === usernameOrDisplayName.toLowerCase());
    }

    if (!user) user = message.author;
    const avatar = await Canvas.loadImage(user.displayAvatarURL({ extension: 'png', size: 512 }));
    const canvas = Canvas.createCanvas(512, 512);
    const ctx = canvas.getContext('2d');

    
    ctx.drawImage(avatar, -256, 0, 512, 512);

    
    ctx.save(); 
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); 
    ctx.drawImage(avatar, -256, 0, 512, 512); 
    ctx.restore();

    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'jooj.png' });
    message.reply({ files: [attachment] });
};

exports.help = {
    name: 'jooj',
    aliases: [],
    description: "Gera uma imagem espelhada. {prefixo}jooj [user]",
    status: false
};
