const { Client, Intents, EmbedBuilder } = require('discord.js');
const { promisify } = require('util');
const sleep = promisify(setTimeout);
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const questions = require("../../api.json").perguntas;
const Discord = require("discord.js");

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

let activeQuizzes = {};

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    const channelId = message.channel.id;

    if (activeQuizzes[channelId]) {
        return message.reply('Já há um quiz em andamento neste canal. Por favor, aguarde o término para iniciar um novo.');
    }

    const isSpecialQuiz = args[0] === "sp";  

    activeQuizzes[channelId] = {
        active: true,
        collector: null,
        questionIndex: 0,
        userScores: {},
        shuffledQuestions: shuffleArray(questions.slice()),
        currentQuestion: null,
        correctAnswerIndex: null,
        answeredUsers: new Set(),
        questionAnswered: false,
        specialQuizTimeout: null  
    };

    const quiz = activeQuizzes[channelId];

    const askQuestion = (question) => {
        const shuffledOptions = shuffleArray(question.options.slice());
        quiz.correctAnswerIndex = shuffledOptions.indexOf(question.options[question.answer]);
        const options = shuffledOptions.map((opt, i) => `${i + 1}. ${opt}`).join('\n');

        const embed = new EmbedBuilder()
            .setTitle('Quiz')
            .setColor(client.cor)
            .setDescription(`${question.question}\n\n${options}`)
            .setFooter({ text: 'Responda com o número correspondente à sua resposta.' });

        if (question.image) {
            embed.setImage(question.image);
        }

        message.channel.send({ embeds: [embed] });
        quiz.currentQuestion = question;
        quiz.answeredUsers.clear();  
        quiz.questionAnswered = false;  
    };

    const filter = response => {
        return !isNaN(response.content) && parseInt(response.content) > 0 && parseInt(response.content) <= 4 && !quiz.answeredUsers.has(response.author.id);
    };

    quiz.collector = message.channel.createMessageCollector({ filter, time: 30000 * quiz.shuffledQuestions.length });
    let currentPlayer = null
    quiz.collector.on('collect', async m => {
        if (!quiz.active || quiz.questionAnswered) return;  

        const answer = parseInt(m.content) - 1;
        if (answer === quiz.correctAnswerIndex) {
            if (currentPlayer && m.author.id !== currentPlayer.id) {
                return message.channel.send(`Aguarde sua vez, ${m.author.username}!`);
              }
          
              currentPlayer = m.author;
            quiz.answeredUsers.add(m.author.id);  
            quiz.questionAnswered = true; 

            if (!quiz.userScores[m.author.id]) {
                quiz.userScores[m.author.id] = { name: m.author.username, score: 0 };
            }
            quiz.userScores[m.author.id].score++;

            await m.reply({ embeds: [new EmbedBuilder().setColor(client.cor).setThumbnail("https://cdn-icons-png.flaticon.com/128/1168/1168610.png").setDescription(`Parabéns, ${m.author.username}! Você acertou!\n\nIniciando a próxima pergunta...`)] });
            message.guild.members.cache.get(client.user.id).permissions.has(Discord.PermissionFlagsBits.AddReactions) ? await m.react('✅'): null;
            quiz.questionIndex++;
            addScore(message.guild.id, m.author.id, 1, message)
            if (quiz.questionIndex < quiz.shuffledQuestions.length) {
                setTimeout(() => {
                    askQuestion(quiz.shuffledQuestions[quiz.questionIndex]);
                }, 5000); 
            } else {
                quiz.collector.stop();
            }
        } else if (!quiz.questionAnswered && !isSpecialQuiz) {
            await m.reply({ embeds: [new EmbedBuilder().setColor(client.cor).setThumbnail("https://cdn-icons-png.flaticon.com/128/1168/1168582.png").setDescription(`# <:bloquear:1275650261574094912> Você Errou! \nResposta errada, ${m.author.username}! A resposta correta era: ${quiz.currentQuestion.options[quiz.currentQuestion.answer]}`)] });
            quiz.collector.stop();        
        } else if (!quiz.questionAnswered && isSpecialQuiz) {
            await m.reply({ embeds: [new EmbedBuilder().setColor(client.cor).setThumbnail("https://cdn-icons-png.flaticon.com/128/1168/1168582.png").setDescription(`# <:bloquear:1275650261574094912> Você Errou!\nResposta errada, ${m.author.username}! A resposta correta era: ${quiz.currentQuestion.options[quiz.currentQuestion.answer]}\nIniciando a próxima pergunta...`)] });
            if (quiz.questionIndex < quiz.shuffledQuestions.length) {
                setTimeout(() => {
                    askQuestion(quiz.shuffledQuestions[quiz.questionIndex+1]);
                }, 5000); 
            } else {
                quiz.collector.stop();
            }
            quiz.answeredUsers.add(m.author.id);  
        }
        setTimeout(() => { currentPlayer = null; }, 5000);
    });

    quiz.collector.on('end', async collected => {
        quiz.active = false; 
        await sleep(1000);
        await displayRanking(message.channel, quiz.userScores);
        await updateGlobalScores(quiz.userScores, message);
        delete activeQuizzes[channelId];
    });
    const displayRanking = async (channel, scores) => {
        const ranking = Object.values(scores)
            .sort((a, b) => b.score - a.score)
            .map((user, index) => {
                if (index == 0) return `<:medalhadeouro:1275833851536736367> ${user.name} - **${user.score}** Pontos`;
                else if (index == 1) return `<:medalhadeprata:1275833849410228264> ${user.name} - **${user.score}** Pontos`;
                else if (index == 2) return `<:medalhadebronze:1275833846503575586> ${user.name} - **${user.score}** Pontos`;
                else return `<:medalhaestrela:1275833855600885844> ${user.name} - **${user.score}** Pontos`;
            })
            .join('\n');

        const embed = new EmbedBuilder()
            .setTitle('**<:cracha:820694021487460352> | Ranking**')
            .setColor(client.cor)
            .setDescription(ranking ? ranking : "Nenhum usuário!")
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/7128/7128236.png");

        await channel.send({ embeds: [embed] });

        const highestScore = Math.max(...Object.values(scores).map(user => user.score));
        const currentRecord = await db.get(`triviaRecord_${message.guild.id}`) || { score: 0, user: null };
        if (highestScore > currentRecord.score) {
            const topUser = Object.values(scores).find(user => user.score === highestScore);
            await db.set(`triviaRecord_${message.guild.id}`, { score: highestScore, user: topUser.name });
            await channel.send(`Novo recorde do servidor! ${topUser.name} marcou ${highestScore} pontos!`);
        }
    };

    if (isSpecialQuiz) {
        quiz.specialQuizTimeout = setTimeout(() => {
            if (quiz.active) {
                quiz.collector.stop();
                message.channel.send('Tempo esgotado para o modo especial! O quiz foi encerrado.');
                quiz.active = false;
                updateGlobalScores(quiz.userScores, message);
                delete activeQuizzes[channelId];
            }
        }, 240000);
    }

    askQuestion(quiz.shuffledQuestions[quiz.questionIndex]);
};

const updateGlobalScores = async (userScores, message) => {
    let globalScores = await db.get('triviaGlobalScores_'+message.guild.id) || {};

    Object.entries(userScores).forEach(([userId, userScore]) => {
        if (!globalScores[userId]) {
            globalScores[userId] = { name: userScore.name, score: 0 };
        }
        globalScores[userId].score += userScore.score;
        
    });

    await db.set('triviaGlobalScores_' + message.guild.id, globalScores);
    await db.set('triviaGlobalScores', globalScores);
};

const addScore = async (guildId, userId, points, message) => {
    const key = `triviaLocalScores_${guildId}`;
    let scores = await db.get(key) || {};
    
    if (!scores[userId]) {
        scores[userId] = { name: message.guild.members.cache.get(userId).user.username, score: 0 };
    }
    
    scores[userId].score += points;
    await db.set(key, scores); 
};

exports.help = {
    name: 'quiz',
    aliases: ['trivia'],
    description: "Responda a quizes e suba no rank! Usage: {prefixo}quiz",
    status: false
};
