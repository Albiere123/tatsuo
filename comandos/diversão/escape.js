const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const status = true;
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
    if (message.author.id !== client.dev.id && status === false) 
        return message.reply({ content: "Este comando está em manutenção!" });

    const command = args[0];
    const channelId = message.channel.id;

    if (command === "maxset") {
        const newLimit = parseInt(args[1]);

        if (isNaN(newLimit) || newLimit <= 0) {
            return message.reply({ content: "Por favor, forneça um número válido para o limite de enigmas." });
        }

        await db.set(`escape_limit_${channelId}`, newLimit);
        message.channel.send(`O limite máximo de enigmas para este canal foi definido como ${newLimit}.`);
    } 
    else if (command === "start") {
        const state = await db.get(`escape_${channelId}`);
        const maxPuzzles = await db.get(`escape_limit_${channelId}`) || 5; 

        if (state) {
            return message.reply({ content: "Já tem um jogo rodando neste canal!" });
        }

        if (puzzles.length < maxPuzzles) {
            return message.reply({ content: `O número máximo de enigmas para este canal é ${maxPuzzles}. Por favor, ajuste o número de enigmas.` });
        }

        
        const shuffledPuzzles = shuffleArray([...puzzles]).slice(0, maxPuzzles);
        const currentPuzzleIndex = 0;

        await db.set(`escape_${channelId}`, {
            currentPuzzleIndex: currentPuzzleIndex,
            puzzles: shuffledPuzzles
        });

        message.channel.send(`O jogo de escape começou! Aqui está o primeiro enigma: ${shuffledPuzzles[currentPuzzleIndex].question}`);
    } 
    else if (command === "responder") {
        const answer = args.slice(1).join(' ').toLowerCase();
        const state = await db.get(`escape_${channelId}`);
        const maxPuzzles = await db.get(`escape_limit_${channelId}`) || 5; 

        if (state) {
            const currentPuzzleIndex = state.currentPuzzleIndex;
            const currentPuzzle = state.puzzles[currentPuzzleIndex];


            if (currentPuzzle.answer === answer) {
                state.currentPuzzleIndex++;
                
                if (state.currentPuzzleIndex < state.puzzles.length) {
                    await db.set(`escape_${channelId}`, state);
                    message.channel.send(`Correto! Aqui está o próximo enigma: ${state.puzzles[state.currentPuzzleIndex].question}`);
                } else {
                    await db.delete(`escape_${channelId}`);
                    message.channel.send('Parabéns! Você resolveu todos os enigmas e escapou!');
                }
            } else {
                message.channel.send('Resposta incorreta. Tente novamente!');
            }
        } else {
            message.channel.send('Nenhum jogo de escape está em andamento. Use `!escape start` para iniciar um novo jogo.');
        }
    } 
    else if (command === "end") {
        const state = await db.get(`escape_${channelId}`);

        if (state) {
            await db.delete(`escape_${channelId}`);
            message.channel.send('O jogo de escape foi encerrado.');
        } else {
            message.channel.send('Nenhum jogo de escape está em andamento.');
        }
    } 
    else {
        message.channel.send(`Comando inválido. Use \`${client.prefix}escape maxset <limite>\`, \`${client.prefix}escape start\`, \`${client.prefix}escape responder [resposta]\` ou \`${client.prefix}escape end\`.`);
    }
}

exports.help = {
    name: "escape",
    aliases: ["puzzles"],
    description: "Jogo de escape com enigmas e desafios. Usage: {prefixo}escape <maxset -> configurar limite || start -> começar || solve -> responder || end -> encerrar>",
    status: status
}
