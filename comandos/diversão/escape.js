const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const api = require("../../api.json");

const puzzles = api.puzzles;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

exports.run = async (client, message, args) => {

    const functions = require("../../functions.js");
    const lang = await functions.getServerLanguage(message.guild.id);
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: await functions.tradutor(lang, "manutenção") });
    }

    const command = args[0];
    const channelId = message.channel.id;

    switch (command) {
        case "maxset":
            const newLimit = parseInt(args[1]);
            if (isNaN(newLimit) || newLimit <= 0) {
                return message.reply({ content: await functions.tradutor(lang, "escape.invalido_limite") });
            }

            await db.set(`escape_limit_${channelId}`, newLimit);
            message.channel.send(await functions.tradutor(lang, "escape.limite_definido", { limite: newLimit }));
            break;

        case "start":
            const state = await db.get(`escape_${channelId}`);
            const maxPuzzles = await db.get(`escape_limit_${channelId}`) || 5;

            if (state) {
                return message.reply({ content: await functions.tradutor(lang, "escape.jogo_andamento") });
            }

            if (puzzles.length < maxPuzzles) {
                return message.reply({ content: await functions.tradutor(lang, "escape.poucos_enigmas", { limite: maxPuzzles }) });
            }

            const shuffledPuzzles = shuffleArray([...puzzles]).slice(0, maxPuzzles);
            const currentPuzzleIndex = 0;

            await db.set(`escape_${channelId}`, {
                currentPuzzleIndex: currentPuzzleIndex,
                puzzles: shuffledPuzzles,
            });

            message.channel.send(await functions.tradutor(lang, "escape.inicio", { enigma: shuffledPuzzles[currentPuzzleIndex].question }));
            break;

        case "responder":
            const answer = args.slice(1).join(' ').toLowerCase();
            const gameState = await db.get(`escape_${channelId}`);

            if (gameState) {
                const currentPuzzleIndex = gameState.currentPuzzleIndex;
                const currentPuzzle = gameState.puzzles[currentPuzzleIndex];

                if (currentPuzzle.answer === answer) {
                    gameState.currentPuzzleIndex++;

                    if (gameState.currentPuzzleIndex < gameState.puzzles.length) {
                        await db.set(`escape_${channelId}`, gameState);
                        message.channel.send(await functions.tradutor(lang, "escape.proximo_enigma", { enigma: gameState.puzzles[gameState.currentPuzzleIndex].question }));
                    } else {
                        await db.delete(`escape_${channelId}`);
                        message.channel.send(await functions.tradutor(lang, "escape.todos_resolvidos"));
                    }
                } else {
                    message.channel.send(await functions.tradutor(lang, "escape.resposta_errada"));
                }
            } else {
                message.channel.send(await functions.tradutor(lang, "escape.sem_jogo"));
            }
            break;

        case "end":
            const currentState = await db.get(`escape_${channelId}`);

            if (currentState) {
                await db.delete(`escape_${channelId}`);
                message.channel.send(await functions.tradutor(lang, "escape.encerrado"));
            } else {
                message.channel.send(await functions.tradutor(lang, "escape.nenhum_jogo"));
            }
            break;

        default:
            message.channel.send(await functions.tradutor(lang, "escape.comando_invalido", { prefix: client.prefix }));
            break;
    }
};

exports.help = {
    name: "escape",
    aliases: ["puzzles"],
    description: "Jogo de escape com enigmas e desafios. Usage: {prefixo}escape <maxset -> configurar limite || start -> começar || responder -> resposta || end -> encerrar>",
    status: false,
};

