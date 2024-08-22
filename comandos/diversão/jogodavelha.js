const Discord = require('discord.js');
const {QuickDB} = require('quick.db')
const db = new QuickDB()
exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;

    if(message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"})
    const player1 = message.author;
    const player2 = message.mentions.users.first();
    let erro = new Discord.EmbedBuilder()
    if (!player2) {
        client.setError(erro, `Aparentemente você não marcou um segundo jogador(bot's não são jogadores válidos!)`)
        client.setUsage(erro, `${client.prefix}jogodavelha <user>`)
        return message.reply({embeds: [erro]})
    }
    
    if(player2.id == message.author.id) {
        client.setError(erro, `Evite marcar você mesmo, sei que deve se sentir solitário. Entretanto deve marcar um 2º Jogador`)
        client.setUsage(erro, `${client.prefix}jogodavelha <user>`)
        return message.reply({embeds: [erro]})
    }

    if(player2.bot) {
        client.setError(erro, `Bot's não são jogadores válidos!`)
        client.setUsage(erro, `${client.prefix}jogodavelha <user>`)
        return message.reply({embeds: [erro]})
    }
    
        const board = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9']
    ];

    let currentPlayer = player1;
    let otherPlayer = player2;
    let gameEnded = false;

    const renderBoard = () => {
        return board.map(row => row.join(' | ')).join('\n---------\n');
    };

    const checkWin = (symbol) => {
        // Check rows, columns, and diagonals for a win
        const winningPatterns = [
            [board[0][0], board[0][1], board[0][2]],
            [board[1][0], board[1][1], board[1][2]],
            [board[2][0], board[2][1], board[2][2]],
            [board[0][0], board[1][0], board[2][0]],
            [board[0][1], board[1][1], board[2][1]],
            [board[0][2], board[1][2], board[2][2]],
            [board[0][0], board[1][1], board[2][2]],
            [board[2][0], board[1][1], board[0][2]]
        ];

        return winningPatterns.some(pattern => pattern.every(cell => cell === symbol));
    };

    const makeMove = (move, symbol) => {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === move) {
                    board[i][j] = symbol;
                    return true;
                }
            }
        }
        return false;
    };

    const playGame = async () => {
        const embed = new Discord.EmbedBuilder()
            .setTitle('**<:jogovelha:1274042600289992796> | Jogo Da Velha**')
            .setDescription(renderBoard())
            .setFooter({text: `Jogador Atual: ${currentPlayer.username}`, iconURL: currentPlayer.avatarURL()})
            .setColor(client.cor)
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/1021/1021264.png")
        const gameMessage = await message.channel.send({ embeds: [embed] });

        const filter = response => {
            return response.author.id === currentPlayer.id && /^[1-9]$/.test(response.content);
        };

        while (!gameEnded) {
            try {
                const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
                const move = collected.first().content;

                if (makeMove(move, currentPlayer.id === player1.id ? 'X' : 'O')) {
                    if (checkWin(currentPlayer.id === player1.id ? 'X' : 'O')) {
                        embed.setDescription(renderBoard())
                            .setFooter({text: `Resultado ${currentPlayer.username} venceu!`, iconURL: currentPlayer.avatarURL()});
                        gameMessage.edit({ embeds: [embed] });
                        gameEnded = true;
                    } else if (board.flat().every(cell => cell === 'X' || cell === 'O')) {
                        embed.setDescription(renderBoard())
                            .setDescription('Resultado: Empate!')
                            .setFooter({text: "Jogo Encerrado!", iconURL: client.user.avatarURL()})
                        gameMessage.edit({ embeds: [embed] });
                        gameEnded = true;
                    } else {
                        [currentPlayer, otherPlayer] = [otherPlayer, currentPlayer];
                        embed.setDescription(renderBoard())
                            .setFooter({text:`Jogador Atual: ${currentPlayer.username}`, iconURL: currentPlayer.avatarURL()});
                        gameMessage.edit({ embeds: [embed] });
                    }
                } else {
                    message.channel.send(`${currentPlayer}, movimento inválido! Tente novamente.`);
                }
            } catch (e) {
                console.log(e)
                message.channel.send('Tempo esgotado! O jogo foi encerrado.');
                gameEnded = true;
            }
        }
    };

    playGame();
}

exports.help = {
    name: 'velha',
    aliases: ['jogodavelha'],
    description: "Jogue o famoso Jogo da Velha! Usage: {prefixo}velha <user>",
    status: false
};
