const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const status = false;

let gameState = {
    isRunning: false,
    suspect: null,
    location: null,
    weapon: null,
    players: new Set(),
};

const suspects = ['Sr. Verde', 'Sra. Branca', 'Coronel Mostarda'];
const locations = ['Biblioteca', 'Sala de Estar', 'Cozinha'];
const weapons = ['Faca', 'Pistola', 'Corda'];

exports.run = async(client, message, args) => {
    if(message.author.id !== client.dev.id && status == false) 
        return message.reply({content: "Este comando está em manutenção!"});

    if (gameState.isRunning) {
        return message.reply('Já há um jogo em andamento!');
    }

    gameState.isRunning = true;
    gameState.suspect = suspects[Math.floor(Math.random() * suspects.length)];
    gameState.location = locations[Math.floor(Math.random() * locations.length)];
    gameState.weapon = weapons[Math.floor(Math.random() * weapons.length)];

    message.channel.send('O jogo de detetive começou! Façam suas perguntas ou tentem uma acusação com `!acusar <suspeito> <local> <arma>`.');

    setTimeout(() => {
        if (gameState.isRunning) {
            message.channel.send(`O tempo acabou! O culpado era ${gameState.suspect}, na ${gameState.location}, com a ${gameState.weapon}.`);
            resetGame();
        }
    }, 300000); // 5 minutos de jogo
};

exports.help = {
    name: "detetive",
    aliases: ["mystery", "crime"],
    description: "Inicia um jogo de detetive. Descubra o culpado, o local e a arma.",
    status: status
};

function resetGame() {
    gameState = {
        isRunning: false,
        suspect: null,
        location: null,
        weapon: null,
        players: new Set(),
    };
}
