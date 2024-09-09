const Discord = require('discord.js');

exports.run = async (client, message, args) => {
    if (!args[0]) {
        let embed = new Discord.EmbedBuilder();
        client.setError(embed, "Você precisa fornecer um emoji, nome ou ID válido.");
        client.setUsage(embed, `${client.prefix}emojiinfo <emoji/nome/id>`);
        return message.reply({ embeds: [embed] });
    }

    const emojiInput = args[0];
    let emoji;

    // Tenta encontrar o emoji globalmente por ID ou nome
    if (emojiInput.match(/^\d+$/)) {
        emoji = client.emojis.cache.get(emojiInput);
    } else {
        emoji = client.emojis.cache.find(e => e.name === emojiInput || `<:${e.name}:${e.id}>` === emojiInput || `<a:${e.name}:${e.id}>` === emojiInput || emojiInput === `${e.name}` || emojiInput === `${e.id}`);
    }

    if (!emoji) {
        let embed = new Discord.EmbedBuilder();
        client.setError(embed, "Emoji não encontrado.");
        return message.reply({ embeds: [embed] });
    }

    // Função para formatar a data em português
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const options = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('pt-BR', options);
    };

    const embed = new Discord.EmbedBuilder()
        .setDescription(`# Informações do Emoji`)
        .setColor(client.cor)
        .addFields([
            { name: '<:imagem1:1275650286899167325> Nome:', value: emoji.name, inline: true },
            { name: '<:imagem:1275650259707629589> ID:', value: emoji.id, inline: true },
            { name: '<:latencia1:1275850306839773316> Animado:', value: emoji.animated ? 'Sim' : 'Não', inline: true },
            { name: '<:celebracao:1277780212368539698> Link:', value: `[Clique aqui](${emoji.url})`, inline: true },
            { name: '<:global:1275650280850984961> Criado em:', value: `${formatDate(emoji.createdTimestamp)}`, inline: true },
        ])
        .setThumbnail(emoji.url)
        .setTimestamp();

    message.reply({ embeds: [embed] });
}

exports.help = {
    name: "emojiinfo",
    aliases: ["ei"],
    description: "Mostra informações detalhadas sobre um emoji globalmente pelo nome, ID ou pelo próprio emoji. Usage: emojiinfo <emoji/nome/id>",
    status: true
}
