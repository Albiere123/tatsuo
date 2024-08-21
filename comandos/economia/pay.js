const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const status = true;

exports.run = async(client, message, args) => {
    if(message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"});

    let embed = new Discord.EmbedBuilder();
    
    
    if (!args[0] || !args[1]) {
        client.setError(embed, "Você deve mencionar um usuário, fornecer o nome de usuário ou ID e especificar um valor.");
        client.setUsage(embed, `${client.prefix}pay <@usuário | nome | ID> <valor>`);
        return message.reply({embeds: [embed]});
    }

    
    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) {
        client.setError(embed, "Você deve especificar um valor válido.");
        client.setUsage(embed, `${client.prefix}pay <@usuário | nome | ID> <valor>`);
        return message.reply({embeds: [embed]});
    }

    
    let user;
    if (message.mentions.users.size) {
        user = message.mentions.users.first();
    } else {
        user = await client.users.fetch(args[0]).catch(() => null);
        if (!user) {
            user = message.guild.members.cache.find(member => 
                member.user.username.toLowerCase() === args[0].toLowerCase()
            )?.user;
        }
    }

    if (!user) {
        client.setError(embed, "Usuário não encontrado. Tente usar a menção, nome de usuário ou ID.");
        client.setUsage(embed, `${client.prefix}pay <@usuário | nome | ID> <valor>`);
        return message.reply({embeds: [embed]});
    }

    
    const senderData = await db.get(`${message.author.id}`);
    const senderBalance = senderData ? senderData.money : 0;
    const senderSb = senderData ? senderData.sb : "";

    
    if (senderBalance < amount) {
        client.setError(embed, "Você não tem saldo suficiente para essa transação.");
        return message.reply({embeds: [embed]});
    }

    
    const confirmEmbed = new Discord.EmbedBuilder()
        .setTitle("Confirmação de Pagamento")
        .setDescription(`${message.author.tag} deseja enviar ${amount} moedas para você. Você aceita?`)
        .setFooter({text: "Responda com 'sim' ou 'não'."})
        .setColor(client.cor)
    const filter = m => m.author.id === user.id && ['sim', 'não'].includes(m.content.toLowerCase());
    message.channel.send({embeds: [confirmEmbed]}).then(() => {
        message.channel.awaitMessages({filter, max: 1, time: 60000, errors: ['time']})
            .then(async collected => {
                const response = collected.first().content.toLowerCase();

                if (response === 'sim') {
                    // Atualiza apenas o saldo do remetente e destinatário, mantendo o "sb"
                    await db.set(`${message.author.id}`, { money: senderBalance - amount, sb: senderSb });
                    
                    const receiverData = await db.get(`${user.id}`);
                    const receiverBalance = receiverData ? receiverData.money : 0;
                    const receiverSb = receiverData ? receiverData.sb : "";
                    const transactionId = Date.now();
                    await db.set(`${user.id}`, { money: receiverBalance + amount, sb: receiverSb });
                    await db.push('transactions', {
                        id: transactionId,
                        type: 'payment',
                        sender: message.author.id,
                        receiver: user.id,
                        amount: amount,
                        timestamp: new Date().toISOString()
                    });
                    message.reply({content: `Transação completa! R$ ${amount} foram enviadas para ${user.tag}.`});
                } else {
                    message.reply({content: "Transação cancelada."});
                }
            })
            .catch((e) => {
                if(e) {console.log(e); return message.reply(e.message)}
                message.reply({content: "Tempo esgotado. A transação foi cancelada."});
            });
    });
}

exports.help = {
    name: "pay",
    aliases: ["pagar", "enviar"],
    description: "Permite enviar moedas para outro usuário usando menção, nome de usuário ou ID. Usage: {prefixo}pay <@usuário | nome | ID> <valor>",
    status: status
};
