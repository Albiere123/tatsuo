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
    const background = await Canvas.loadImage('https://i.imgur.com/8620BoX.jpeg');
        const canvas = Canvas.createCanvas(background.width, background.height);
        const ctx = canvas.getContext('2d');

        
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);


        const avatar = await Canvas.loadImage(user.displayAvatarURL({ extension: 'png', size: 2048 }));

       
        ctx.drawImage(avatar, 45, 240, 646, 468);

        
        const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'wanted.png' });

        
        message.channel.send({ files: [attachment] });
};

exports.help = {
    name: 'wanted',
    aliases: [],
    description: "Coloca o avatar do usuário mencionado ou do autor da mensagem em um cartaz de 'Procurado'.",
    status: false
};
