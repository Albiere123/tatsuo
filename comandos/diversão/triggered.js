const { AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const { QuickDB } = require("quick.db");
const GIFEncoder = require('gifencoder');
const fs = require('fs');
const path = require('path');
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
    
    try {
        const avatar = await Canvas.loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));

        
        const gifPath = path.join(__dirname, 'triggered.gif');

        
        const encoder = new GIFEncoder(256, 256);
        encoder.createReadStream().pipe(fs.createWriteStream(gifPath));
        encoder.start();
        encoder.setRepeat(0); 
        encoder.setDelay(100); 

        for (let i = 0; i < 10; i++) {
            const canvas = Canvas.createCanvas(256, 256);
            const ctx = canvas.getContext('2d');

            
            const xOffset = Math.floor(Math.random() * 10) - 5;
            const yOffset = Math.floor(Math.random() * 10) - 5;

           
            ctx.drawImage(avatar, xOffset, yOffset, 256, 256);

            
            ctx.globalAlpha = 0.3; 
            ctx.fillStyle = 'yellow'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height); 
            ctx.globalAlpha = 1.0; 

           
            ctx.fillStyle = 'red';
            ctx.font = 'bold 28px "Arial"'; 
            ctx.fillText('TRIGGERED', 10, 230);

            
            encoder.addFrame(ctx);
        }

        encoder.finish();

        
        setTimeout(async () => {
            
            const attachment = new AttachmentBuilder("../../triggered.gif", { name: 'triggered.gif' });
            message.reply({ files: [attachment] });

            
            fs.unlinkSync(gifPath);
            
        }, 2000);
    } catch (e) {
        console.log(e);
        message.reply({ content: "Houve um erro ao gerar o GIF." });
    }
};

exports.help = {
    name: 'triggered',
    aliases: [],
    description: "Aplica o efeito 'triggered' na imagem do avatar do usuário mencionado ou do autor da mensagem, gerando um GIF com o efeito de tremor.",
    status: false
};
