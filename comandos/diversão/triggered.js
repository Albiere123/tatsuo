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

        const gifPath = path.join(__dirname, '../../data/triggered.gif');

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
            
            
            ctx.fillStyle = 'red';

            
            ctx.fillRect(xOffset, xOffset+180, 256, 75); 
            
            ctx.globalAlpha = 0.4; 
            ctx.fillStyle = 'black'; 
            ctx.fillRect(xOffset, yOffset, 256, 256);
            ctx.globalAlpha = 1.0;
            

            ctx.fillStyle = 'white';
            ctx.font = 'bold 28px "Arial"'; 
            ctx.fillText('TRIGGERED', xOffset+10, yOffset+230);


            encoder.addFrame(ctx);
        }

        encoder.finish();

        setTimeout(async () => {
            const attachment = new AttachmentBuilder("./data/triggered.gif", { name: 'triggered.gif' });
            await message.reply({ files: [attachment] });

            // Remove o arquivo GIF gerado
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
    description: "Aplica o efeito 'triggered' na imagem do avatar, gerando um GIF com o efeito de tremor. Usage: {prefixo}triggered [user]",
    status: false
};
