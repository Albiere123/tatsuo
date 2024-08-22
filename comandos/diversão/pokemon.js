const Discord = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { createCanvas, loadImage } = require('canvas');
const gameStates = {};
const {QuickDB} = require('quick.db')
const db = new QuickDB()
async function startGame(message, client) {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;

    if (message.author.id !== client.dev.id && status == false) return message.reply({ content: "Este comando está em manutenção!" });

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
        
        const arrayBuffer = await imageResponse.arrayBuffer();
        const image = await loadImage(Buffer.from(arrayBuffer));

        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(image, 0, 0);

        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const outputBuffer = canvas.toBuffer();

        const attachment = new Discord.AttachmentBuilder(outputBuffer, { name: 'pokemon.png' });
        const embed = new Discord.EmbedBuilder()
            .setColor(client.cor)
            .setTitle("<:gengar:1270450755517681705> | Quem é esse pokemooon?")
            .setImage('attachment://pokemon.png');

        gameStates[channelId] = {
            name: pokemonName,
            answeredUsers: new Set(),
            collector: null
        };

        await message.channel.send({ embeds: [embed], files: [attachment] });

        const filter = response => {
            return response.content.toLowerCase() === gameStates[channelId].name && response.channel.id === channelId;
        };

        gameStates[channelId].collector = message.channel.createMessageCollector({ filter, time: 60000 });

        gameStates[channelId].collector.on('collect', response => {
            if (!gameStates[channelId].answeredUsers.has(response.author.id)) {
                gameStates[channelId].answeredUsers.add(response.author.id);
                message.channel.send(`${response.author.username} acertou! O Pokémon é \`${gameStates[channelId].name}\`!`);
                message.channel.send({content: `Reiniciando o jogo...`})
                gameStates[channelId].collector.stop();

                // Reinicia o jogo automaticamente após 5 segundos se alguém acertar
                setTimeout(() => {
                    startGame(message, client);
                }, 5000);
            } else {
                response.reply('Você já respondeu a essa imagem!');
            }
        });

        gameStates[channelId].collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send(`O tempo acabou! O Pokémon era \`${gameStates[channelId].name}\`.`);
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
};

exports.help = {
    name: "pokemon",
    aliases: [],
    description: "Quem é esse pokemoon? Usage: {prefixo}pokemon",
    status: false
};
