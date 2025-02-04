const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();


exports.run = async (client, message, args) => {
    const functions = require("../../functions.js")
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && status === false) {

        return message.reply({ content: await functions.tradutor(await functions.getServerLanguage(message.guild.id), "manutenção")});
    }
    let error = new Discord.EmbedBuilder()
    const lang = await functions.getServerLanguage(message.guild.id)
    const dashboard = await db.get(`dashboard.${message.guild.id}.canais`) || {};
    const confessionChannelId = dashboard.confess || {id: "Nenhum"};
    
    const confessionChannel = client.channels.cache.get(confessionChannelId.id);
    if (!confessionChannel) {
        await client.setError(message, error, await functions.tradutor(lang, "confess.canal_invalido", {prefixo: client.prefix}))
        await client.setUsage(message, error, await functions.tradutor(lang, "confess.usage", {prefixo: client.prefix}))
        return message.reply({ embeds: [error] });
    }

    
    const confession = args.join(' ');
    if (!confession) {
        await client.setError(message, error, await functions.tradutor(lang, "confess.no_args"))
        await client.setUsage(message, error, await functions.tradutor(lang, "confess.usage", {prefixo: prefix}))
        return message.reply({ embeds: [error] });
    }

    
    const confessionData = {
        confession: confession,
        user_id: message.author.id,
        timestamp: Date.now()
    };
    await db.push('confessions', confessionData);

    
    const embed = new Discord.EmbedBuilder()
        .setDescription(`# <:avaliacao:1275831072554356918> ${await functions.tradutor(lang, "confess.title")}

"${confession}"`)
        .setColor(client.cor)
        .setFooter({ text: await functions.tradutor(lang, "confess.footer"), iconURL: 'https://cdn-icons-png.flaticon.com/512/3400/3400837.png' });

    confessionChannel.send({ embeds: [embed] });

    message.reply({ content: await functions.tradutor(lang, "confess.finnaly") }).then(msg => {
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
    status: false
};
