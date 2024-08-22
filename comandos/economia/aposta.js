const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async(client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;

    if(message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"});

    let embed = new Discord.EmbedBuilder();

    if (!args[0] || !args[1]) {
        client.setError(embed, "Você deve especificar o tipo de aposta e o valor.");
        client.setUsage(embed, `${client.prefix}bet <solo|duo> <valor> [multiplicador] [@usuário]`);
        return message.reply({embeds: [embed]});
    }

    const type = args[0].toLowerCase();
    const amount = parseInt(args[1]);

    if (isNaN(amount) || amount <= 0) {
        client.setError(embed, "Valor inválido. Escolha um valor positivo.");
        client.setUsage(embed, `${client.prefix}bet <solo|duo> <valor> [multiplicador] [@usuário]`);
        return message.reply({embeds: [embed]});
    }

    const userData = await db.get(`${message.author.id}`);
    if (!userData || userData.money < amount) {
        client.setError(embed, "Você não tem saldo suficiente para essa aposta.");
        return message.reply({embeds: [embed]});
    }

    let transactionId;

    if (type === 'solo') {
        if (!args[2]) {
            client.setError(embed, "Você deve especificar um multiplicador para o modo solo.");
            client.setUsage(embed, `${client.prefix}bet solo <valor> <multiplicador>`);
            return message.reply({embeds: [embed]});
        }

        const multiplier = parseFloat(args[2]);

        if (isNaN(multiplier) || multiplier < 1 || multiplier > 2.4) {
            client.setError(embed, "Multiplicador inválido. Escolha um multiplicador entre 1 e 2.4.");
            client.setUsage(embed, `${client.prefix}bet solo <valor> <multiplicador>`);
            return message.reply({embeds: [embed]});
        }

        const winChance = 100 / multiplier;
        const random = Math.random() * 100;

        if (random <= winChance) {
            const winnings = Math.floor(amount * multiplier);
            await db.set(`${message.author.id}`, { money: userData.money + winnings - amount, sb: userData.sb });
            embed.setTitle("Parabéns!")
                .setDescription(`Você apostou ${amount} moedas com um multiplicador de ${multiplier}x e ganhou ${winnings} moedas!`)
                .setColor(client.cor);
        } else {
            await db.set(`${message.author.id}`, { money: userData.money - amount, sb: userData.sb });
            embed.setTitle("Que pena!")
                .setDescription(`Você apostou ${amount} moedas com um multiplicador de ${multiplier}x e perdeu tudo!`)
                .setColor(client.cor);
        }
        message.reply({embeds: [embed]})
        transactionId = Date.now();
        await db.push('transactions', {
            id: transactionId,
            type: 'solo_bet',
            sender: message.author.id,
            winner: random <= winChance ? message.author.id : null,
            loser: random > winChance ? message.author.id : null,
            amount: amount,
            multiplier: multiplier,
            timestamp: new Date().toISOString()
        });

    } else if (type === 'duo') {
        const opponent = message.mentions.users.first();

        if (!opponent) {
            client.setError(embed, "Você deve mencionar um usuário para desafiar.");
            client.setUsage(embed, `${client.prefix}bet duo <valor> @usuário`);
            return message.reply({embeds: [embed]});
        }

        if (opponent.id === message.author.id) {
            client.setError(embed, "Você não pode desafiar a si mesmo.");
            client.setUsage(embed, `${client.prefix}bet duo <valor> @usuário`);
            return message.reply({embeds: [embed]});
        }

        const confirmEmbed = new Discord.EmbedBuilder()
            .setTitle("Desafio de Aposta!")
            .setDescription(`${message.author.tag} desafiou você para uma aposta de ${amount} moedas. Aceita? Responda com 'sim' ou 'não'.`)
            .setFooter({text: "Responda com 'sim' ou 'não'."});

        const filter = m => m.author.id === opponent.id && ['sim', 'não'].includes(m.content.toLowerCase());
        message.channel.send({embeds: [confirmEmbed]}).then(() => {
            message.channel.awaitMessages({filter, max: 1, time: 60000, errors: ['time']})
                .then(async collected => {
                    const response = collected.first().content.toLowerCase();

                    if (response === 'sim') {
                        const random = Math.random() < 0.5 ? message.author.id : opponent.id;
                        const winner = random === message.author.id ? message.author : opponent;
                        const loser = random === message.author.id ? opponent : message.author;

                        const winnerData = await db.get(`${winner.id}`);
                        const loserData = await db.get(`${loser.id}`);

                        await db.set(`${winner.id}`, { money: winnerData.money + amount, sb: winnerData.sb, trabalho: winnerData.trabalho });
                        await db.set(`${loser.id}`, { money: loserData.money - amount, sb: loserData.sb, trabalho: loserData.trabalho });

                        embed
                            .setDescription(`# <:aposta:1275832004700667924> Aposta Completa!
ㅤ
${winner.tag} ganhou ${amount} moedas de ${loser.tag}!`)
                            .setColor(client.cor);

                        transactionId = Date.now();
                        await db.push('transactions', {
                            id: transactionId,
                            type: 'duo_bet',
                            winner: winner.id,
                            loser: loser.id,
                            amount: amount,
                            timestamp: new Date().toISOString()
                        });

                    } else {
                        embed.setTitle("Aposta Cancelada")
                            .setDescription("O desafio foi recusado.")
                            .setColor(client.cor);
                    }

                    message.reply({embeds: [embed]});
                })
                .catch(() => {
                    embed.setTitle("Tempo Esgotado")
                        .setDescription("O desafio de aposta expirou.")
                        .setColor(client.cor);

                    message.reply({embeds: [embed]});
                });
        });

    } else {
        client.setError(embed, "Tipo de aposta inválido. Use 'solo' ou 'duo'.");
        client.setUsage(embed, `${client.prefix}bet <solo|duo> <valor> [multiplicador] [@usuário]`);
        return message.reply({embeds: [embed]});
    }
}

exports.help = {
    name: "bet",
    aliases: ["aposta"],
    description: "Realize uma aposta solo com multiplicador ou uma aposta duo com outro usuário. Usage: {prefixo}bet <solo|duo> <valor> [multiplicador] [@usuário]",
    status: false
};
