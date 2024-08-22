const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();


exports.run = async(client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"});

    let embed = new Discord.EmbedBuilder();
    
    const transactions = await db.get('transactions') || [];
    
    let targetUserId = message.author.id; 
    let page = parseInt(args[1]) || 1;

    if (args[0]) {
        const mentionedUser = message.mentions.users.first();
        if (mentionedUser) {
            targetUserId = mentionedUser.id;
        } else {
            const user = client.users.cache.find(m => m.username.toLowerCase() === args[0].toLowerCase() || m.id === args[0]);
            if (user) {
                targetUserId = user.id;
            } else if (!isNaN(args[0])) {
                targetUserId = args[0];
            } else {
                client.setError(embed, "Usuário não encontrado. Certifique-se de mencionar um usuário, usar um ID válido ou um nome de usuário correto.");
                client.setUsage(embed, `${client.prefix}transactions [@usuário|id|nome] [página]`);
                return message.reply({embeds: [embed]});
            }
        }
    }

   
    const userTransactions = transactions.filter(tx => tx.sender === targetUserId || tx.receiver === targetUserId).reverse();

   
    if (userTransactions.length > 16) {
        await db.set('transactions', userTransactions.slice(-16));
    }

   
    const pageSize = 4;
    const totalPages = Math.ceil(userTransactions.length / pageSize);
    page = Math.max(1, Math.min(page, totalPages)); 

    const transactionsToShow = userTransactions.slice((page - 1) * pageSize, page * pageSize);

    if (transactionsToShow.length === 0) {
        embed
            .setDescription(`<:historicodetransacoes:1275658669501186120> Sem Transações
Não há transações registradas para ${targetUserId === message.author.id ? 'você' : `${client.users.cache.get(targetUserId).username}`}.`)
            .setColor(client.cor)
            .setThumbnail(client.users.cache.get(targetUserId).avatarURL({size:2048, extension: "png"}));
    } else {
        embed
            .setColor(client.cor)
            .setDescription(`# <:historicodetransacoes:1275658669501186120> Histórico de Transações ${targetUserId === message.author.id ? '' : `para ${client.users.cache.get(targetUserId).username}`}
ㅤ\n`+transactionsToShow.map(tx => {
                const type = tx.type === 'payment' ? 'Pagamento' : (tx.type === 'solo_bet' ? 'Aposta Solo' : 'Aposta Duo');
                return `**<:transacoes:1275658665948610580> Transação**\n**ID:** ${tx.id}\n**Tipo:** ${type}\n**Valor:** R$ ${tx.amount}\n**Timestamp:** ${tx.timestamp}\n**Detalhes:** ${tx.type === 'solo_bet' ? `Multiplicador: ${tx.multiplier}` :tx.type == "payment" && tx.receiver == targetUserId ? `Recebido de: ${client.users.cache.get(tx.sender).username}`: tx.sender == targetUserId ? `Enviado para: ${client.users.cache.get(tx.receiver).username}` : ``}`
            }).join('\n\n'))
            .setFooter({text: `Página ${page} de ${totalPages}`})
            .setThumbnail(client.users.cache.get(targetUserId).avatarURL({size:2048, extension: "png"}));
    }

    
    const row = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setCustomId('prev')
                .setLabel('Anterior')
                .setStyle(Discord.ButtonStyle.Primary) 
                .setDisabled(page === 1), 
            new Discord.ButtonBuilder()
                .setCustomId('next')
                .setLabel('Próximo')
                .setStyle(Discord.ButtonStyle.Primary) 
                .setDisabled(page >= totalPages) 
        );

    const msg = await message.reply({embeds: [embed], components: [row]});

    
    const filter = i => i.user.id === message.author.id;
    const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
        if (i.customId === 'prev') {
            page = page - 1;
        } else if (i.customId === 'next') {
            page = page + 1;
        }

        
        const updatedTransactionsToShow = userTransactions.slice((page - 1) * pageSize, page * pageSize);

        embed
            .setColor(client.cor)
            .setDescription(`# <:historicodetransacoes:1275658669501186120> Histórico de Transações ${targetUserId === message.author.id ? '' : `para ${client.users.cache.get(targetUserId).username}`}
ㅤ\n`+updatedTransactionsToShow.map((tx, index) => {
                const type = tx.type === 'payment' ? 'Pagamento' : (tx.type === 'solo_bet' ? 'Aposta Solo' : 'Aposta Duo');
                return `**<:transacoes:1275658665948610580> Transação**\n**ID:** ${tx.id}\n**Tipo:** ${type}\n**Valor:** R$ ${tx.amount}\n**Timestamp:** ${tx.timestamp}\n**Detalhes:** ${tx.type === 'solo_bet' ? `Multiplicador: ${tx.multiplier}` :tx.type == "payment" && tx.receiver == targetUserId ? `Recebido de: ${client.users.cache.get(tx.sender).username}`: tx.sender == targetUserId ? `Enviado para: ${client.users.cache.get(tx.receiver).username}` : ``}`
            }).join('\n\n'))
            .setFooter({text: `Página ${page} de ${totalPages}`})
        
        row.components[0].setDisabled(page <= 1);
        row.components[1].setDisabled(page >= totalPages);

        await i.update({embeds: [embed], components: [row]});
    });

    collector.on('end', collected => {
        
        row.components.forEach(button => button.setDisabled(true));
        msg.edit({components: [row]});
    });
}

exports.help = {
    name: "transactions",
    aliases: ["transacoes"],
    description: "Veja o histórico de transações (pagamentos e apostas) realizadas para você ou outro usuário. Usage: {prefixo}transactions [@usuário|id|nome] [página]",
    status: false
};
