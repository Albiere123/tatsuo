const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const gameStates = {};

async function startGame(message, client) {
    const channelId = message.channel.id;

    if (gameStates[channelId] && gameStates[channelId].collector) {
        return message.channel.send('Já há um jogo em andamento neste canal.');
    }

    const pokemonNumber = Math.floor(Math.random() * 898) + 1;
    const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonNumber}.png`;
    const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonNumber}/`;

    try {
        const response = await fetch(pokemonUrl);
        if (!response.ok) throw new Error('Erro ao buscar dados do Pokémon');

        const data = await response.json();
        const pokemonName = data.name ? data.name.toLowerCase() : 'unknown';

        const imageResponse = await fetch(spriteUrl);
        if (!imageResponse.ok) throw new Error('Erro ao buscar imagem do Pokémon');

        const imageBuffer = await imageResponse.buffer();
        const image = await loadImage(imageBuffer);
        
        
        const canva1 = createCanvas(image.width, image.height);
        const c1 = canva1.getContext('2d');
        c1.drawImage(image, 0, 0);

        c1.globalCompositeOperation = 'source-atop';
        c1.fillStyle = 'black';
        c1.fillRect(0, 0, canva1.width, canva1.height);

        const imageC = canva1.toBuffer();
        
        const baseImage = await loadImage('https://static.quizur.com/i/b/57c1c26fc0b812.5998420157c1c26fb156c9.51498011.png');
        const imageB = await loadImage(imageC);

        
        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(baseImage, 0, 0);

       
        const pokemonWidth = 190;
        const pokemonHeight = 230; 
        const pokemonX = 25; 
        const pokemonY = 130; 

        ctx.drawImage(imageB, pokemonX, pokemonY, pokemonWidth, pokemonHeight);

        const initialBuffer = canvas.toBuffer();
        const attachment = new AttachmentBuilder(initialBuffer, { name: 'pokemon_hidden.png' });
        const embed = new EmbedBuilder()
            .setColor(client.cor)
            .setTitle('<:gengar:1270450755517681705> | Quem é esse pokemooon?')
            .setImage('attachment://pokemon_hidden.png');

        gameStates[channelId] = {
            name: pokemonName.toLowerCase(),
            answeredUsers: new Set(),
            collector: null,
            imageBuffer: initialBuffer,
            pokemonImage: image
        };

        await message.channel.send({ embeds: [embed], files: [attachment] });

        const filter = response => {
            return response.content.toLowerCase() === gameStates[channelId].name && response.channel.id === channelId;
        };

        gameStates[channelId].collector = message.channel.createMessageCollector({ filter, time: 60000 });

        gameStates[channelId].collector.on('collect', (response) => {
            if (!gameStates[channelId].answeredUsers.has(response.author.id)) {
                gameStates[channelId].answeredUsers.add(response.author.id);

                
                const revealCanvas = createCanvas(baseImage.width, baseImage.height);
                const revealCtx = revealCanvas.getContext('2d');

                revealCtx.drawImage(baseImage, 0, 0);

               
                revealCtx.globalCompositeOperation = 'source-over';
                revealCtx.drawImage(gameStates[channelId].pokemonImage, pokemonX, pokemonY, pokemonWidth, pokemonHeight);

                const revealBuffer = revealCanvas.toBuffer();
                const revealAttachment = new AttachmentBuilder(revealBuffer, { name: 'pokemon_revealed.png' });
                const revealEmbed = new EmbedBuilder()
                    .setColor(client.cor)
                    .setTitle(`${response.author.username} acertou! O Pokémon é \`${gameStates[channelId].name}!\``)
                    .setImage('attachment://pokemon_revealed.png');

                message.channel.send({ embeds: [revealEmbed], files: [revealAttachment] });

                gameStates[channelId].collector.stop();
            } else {
                response.reply('Você já respondeu a essa imagem!');
            }
        });

        gameStates[channelId].collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`O tempo acabou! O Pokémon era \`${gameStates[channelId].name}.\``);
            }
            delete gameStates[channelId];
        });

    } catch (error) {
        console.error('Erro ao processar o comando:', error);
        message.channel.send('Houve um erro ao processar o comando. Tente novamente mais tarde.');
    }
}

exports.run = async (client, message, args) => {
    await startGame(message, client);
}

exports.help = {
    name: "pokemon",
    description: "Jogue o famoso \"Quem é esse pokemooon?\"",
    status: false,
    aliases: []
}
