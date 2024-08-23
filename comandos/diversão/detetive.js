const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

let gameState = {
    isRunning: false,
    suspect: null,
    location: null,
    weapon: null,
    players: new Set(),
    hintsGiven: 0,  
};

const suspects = ['Sr.-Verde', 'Sra.-Branca', 'Coronel-Mostarda'];
const locations = ['Biblioteca', 'Sala-de-Estar', 'Cozinha'];
const weapons = ['Faca', 'Pistola', 'Corda'];

exports.run = async(client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;

    if(message.author.id !== client.dev.id && status == false) 
        return message.reply({content: "Este comando está em manutenção!"});

    if (!args[0]) {
        if (gameState.isRunning) {
            return message.reply('Já há um jogo em andamento!');
        }
        gameState.isRunning = true;
        gameState.suspect = suspects[Math.floor(Math.random() * suspects.length)];
        gameState.location =
         locations[Math.floor(Math.random() * locations.length)];
        gameState.weapon = weapons[Math.floor(Math.random() * weapons.length)];
        gameState.hintsGiven = 0; 

        message.channel.send('O jogo de detetive começou! Façam suas perguntas ou tentem uma acusação com `'+client.prefix+'detetive acusar <suspeito> <local> <arma>`'+`\nCaso não saiba as opções disponiveis use \`${client.prefix}detetive ajuda\``);
        giveHint(message)
        setTimeout(giveHint, 60000, message);  
    } else if (args[0] == "acusar") {
        if (!args[1] || !args[2] || !args[3]) {
            return message.reply({content: "Você não utilizou o comando corretamente. Use: `"+client.prefix+`detetive acusar <suspeito> <local> <arma>\`\nCaso não saiba as opções disponiveis use \`${client.prefix}detetive ajuda\``});
        }
        if (args[1] !== gameState.suspect || args[2] !== gameState.location || args[3] !== gameState.weapon) {
            return message.reply({content: "Você errou! Tente novamente."});
        } else {
            message.reply("Você ganhou!!");
            resetGame();
        }
    }else if (args[0] == "encerrar") {
        resetGame();
        message.reply({content: "O jogo foi forcado a encerrar por "+ message.author.username})
    }else if (args[0] == "help" || args[0] == "ajuda") {
        let embed = new Discord.EmbedBuilder()
        .setDescription(`# Detetive
ㅤ
Suspeitos: ${suspects.join(", ")}
ㅤ
Locais: ${locations.join(", ")}
ㅤ
Armas: ${weapons.join(", ")}`)
        .setColor(client.cor)
        message.reply({embeds: [embed]})
    }
};

function giveHint(message) {
    if (!gameState.isRunning) return;

    let hint;
    switch(gameState.hintsGiven) {
        case 0:
            hint = `Dica: O suspeito não é ${suspects.find(s => s !== gameState.suspect)}.`;
            break;
        case 1:
            hint = `Dica: O crime não aconteceu na ${locations.find(l => l !== gameState.location)}.`;
            break;
        case 2:
            hint = `Dica: A arma não é ${weapons.find(w => w !== gameState.weapon)}.`;
            break;
        default:
            return;  
    }
    message.channel.send(hint);
    gameState.hintsGiven++;

    if (gameState.hintsGiven < 3) {
        setTimeout(giveHint, 60000, message);  
    }
}

function resetGame() {
    gameState = {
        isRunning: false,
        suspect: null,
        location: null,
        weapon: null,
        players: new Set(),
        hintsGiven: 0,
    };
}

exports.help = {
    name: "detetive",
    aliases: ["mystery", "crime"],
    description: "Inicia um jogo de detetive. Descubra o culpado, o local e a arma.",
    status: false
};
