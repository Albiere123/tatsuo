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
    const functions = require("../../functions.js")
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: functions.tradutor(functions.getServerLanguage(message.guild.id), "manutenção")});
    }
    if (!args[0]) {
        if (gameState.isRunning) {
            return message.reply({
                content: await functions.tradutor(lang, "detetive.jogo_andamento"),
            });
        }
        gameState.isRunning = true;
        gameState.suspect = suspects[Math.floor(Math.random() * suspects.length)];
        gameState.location = locations[Math.floor(Math.random() * locations.length)];
        gameState.weapon = weapons[Math.floor(Math.random() * weapons.length)];
        gameState.hintsGiven = 0;

        message.channel.send(
            await functions.tradutor(lang, "detetive.inicio", {
                prefix: client.prefix,
            })
        );
        giveHint(message, lang);
        setTimeout(giveHint, 60000, message, lang);
    } else if (args[0] == "acusar") {
        if (!args[1] || !args[2] || !args[3]) {
            return message.reply({
                content: await functions.tradutor(lang, "detetive.erro_acusacao", {
                    prefix: client.prefix,
                }),
            });
        }
        if (
            args[1] !== gameState.suspect ||
            args[2] !== gameState.location ||
            args[3] !== gameState.weapon
        ) {
            return message.reply({
                content: await functions.tradutor(lang, "detetive.errou"),
            });
        } else {
            message.reply(await functions.tradutor(lang, "detetive.ganhou"));
            resetGame();
        }
    } else if (args[0] == "encerrar") {
        resetGame();
        message.reply({
            content: await functions.tradutor(lang, "detetive.encerrado", {
                user: message.author.username,
            }),
        });
    } else if (args[0] == "ajuda") {
        let embed = new Discord.EmbedBuilder()
            .setDescription(
                await functions.tradutor(lang, "detetive.ajuda", {
                    suspects: suspects.join(", "),
                    locations: locations.join(", "),
                    weapons: weapons.join(", "),
                })
            )
            .setColor(client.cor);
        message.reply({ embeds: [embed] });
    }
};

async function giveHint(message, lang) {
    if (!gameState.isRunning) return;

    let hint;
    switch (gameState.hintsGiven) {
        case 0:
            hint = await functions.tradutor(lang, "detetive.dica_suspeito", {
                notSuspect: suspects.find((s) => s !== gameState.suspect),
            });
            break;
        case 1:
            hint = await functions.tradutor(lang, "detetive.dica_local", {
                notLocation: locations.find((l) => l !== gameState.location),
            });
            break;
        case 2:
            hint = await functions.tradutor(lang, "detetive.dica_arma", {
                notWeapon: weapons.find((w) => w !== gameState.weapon),
            });
            break;
        default:
            return;
    }
    message.channel.send(hint);
    gameState.hintsGiven++;

    if (gameState.hintsGiven < 3) {
        setTimeout(giveHint, 60000, message, lang);
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
    aliases: ["mistério", "crime"],
    description: "Inicia um jogo de detetive. Descubra o culpado, o local e a arma. Uso: {prefixo}detetive",
    status: false,
};
