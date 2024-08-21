const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const status = true;

exports.run = async (client, message, args) => {
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }
    let error = new Discord.EmbedBuilder()

    const dashboard = await db.get(`dashboard.${message.guild.id}.canais`) || {};
    const confessionChannelId = dashboard.confess || {id: "Nenhum"};
    
    const confessionChannel = client.channels.cache.get(confessionChannelId.id);
    if (!confessionChannel) {
        client.setError(error, "Canal de confissões não encontrado! Peço que avise a um Staff do servidor com a permissão de `Gerenciar Canais`")
        client.setUsage(error, `${client.prefix}confess <mensagem>`)
        return message.reply({ embeds: [error] });
    }

    
    const confession = args.join(' ');
    if (!confession) {
        client.setError(error, `Parece que esqueceu de colocar a mensagem para a confissão...`)
        client.setUsage(error, `${client.prefix}confess <mensagem>`)
        return message.reply({ embeds: [error] });
    }

    
    const confessionData = {
        confession: confession,
        user_id: message.author.id,
        timestamp: Date.now()
    };
    await db.push('confessions', confessionData);

    
    const embed = new Discord.EmbedBuilder()
        .setDescription(`# <:negado:967577164423766066> | Confissão

"${confession}"`)
        .setColor(client.cor)
        .setFooter({ text: 'Enviada anonimamente', iconURL: 'https://cdn-icons-png.flaticon.com/512/3400/3400837.png' });

    confessionChannel.send({ embeds: [embed] });

    message.reply({ content: 'Sua confissão foi enviada anonimamente.' }).then(msg => {
    setInterval(() => {
        msg.delete()
        if(!client.user.permissions.has(Discord.PermissionFlagsBits.ManageMessages)) return;
        message.delete()
    }, 15000)
    });
};

exports.help = {
    name: "confess",
    aliases: ["confissão", "confessao", 'confessar'],
    description: "Envie uma confissão anônima. Usage: {prefixo}confess <mensagem>",
    status: status
};
