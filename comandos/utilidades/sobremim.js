const Discord = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    const userId = message.author.id;
    const cooldownHours = 4;
    const maxDescriptionLength = 32; 
    const now = new Date();
    
    let erro = new Discord.EmbedBuilder();

    const lastUpdate = await db.get(`sobremim_${userId}_timestamp`);
    if (lastUpdate && message.author.id != client.dev.id) {
        const lastUpdateDate = new Date(lastUpdate);
        const timeDiff = now - lastUpdateDate;
        const hoursPassed = timeDiff / (1000 * 60 * 60);

        if (hoursPassed < cooldownHours) {
            const remainingTime = Math.ceil(cooldownHours - hoursPassed);
            client.setError(erro, `Você deve esperar ${remainingTime} horas antes de atualizar sua descrição novamente.`);
            client.setUsage(erro, `${client.prefix}sobre <descrição curta>`);
            return message.reply({ embeds: [erro] });
        }
    }

    const newAbout = args.join(' ');
    if (!newAbout) {
        client.setError(erro, `Forneça uma descrição!`);
        client.setUsage(erro, `${client.prefix}sobre <descrição>`);
        return message.reply({ embeds: [erro] });
    }

    if (newAbout.includes("\n") || newAbout.includes("\r")) {
        client.setError(erro, `Evite usar quebra de linha.`);
        client.setUsage(erro, `${client.prefix}sobre <descrição>`);
        return message.reply({ embeds: [erro] }); 
    }

    // Contar "{emoji:ID}" e "{Bot}" como 1 caractere
    const adjustedLength = newAbout.replace(/\{emoji:\d+\}|\{Bot\}/g, 'x').length;

    let truncatedAbout = newAbout;
    if (adjustedLength > maxDescriptionLength) {
        let currentLength = 0;
        let cutIndex = 0;

        for (let i = 0; i < newAbout.length; i++) {
            const remainingText = newAbout.slice(i);
            const match = remainingText.match(/^\{emoji:\d+\}|\{Bot\}/);

            if (match) {
                currentLength += 1;
                i += match[0].length - 1; // Avançar o índice para pular o match
            } else {
                currentLength += 1;
            }

            if (currentLength > maxDescriptionLength) break;
            cutIndex = i + 1;
        }

        truncatedAbout = newAbout.slice(0, cutIndex) + (cutIndex < newAbout.length ? '...' : '');
    }

    const tb = (await db.get(userId)) ? (await db.get(userId))?.trabalho : "";
    let oldAbout = (await db.get(userId))?.sb || 'Não definido';
    await db.set(`${userId}`, {money: (await db.get(userId))?.money, sb: truncatedAbout, trabalho: tb});
    await db.set(`sobremim_${userId}_timestamp`, now.toISOString());

    let embed = new Discord.EmbedBuilder()
        .setDescription(`# <:adicionarusuario:1275650271929827440> Sobremim
ㅤ
**<:transferenciadedados:1275650263511994409> Antiga descrição:** ${oldAbout}
ㅤ
**<:mudar:1275650265206493276> Nova descrição:** ${truncatedAbout}
ㅤ`)
        .setColor(client.cor)
        .setThumbnail(`https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd_JI5ApY2ZwutFAjg-ELaP_Af6bIHSKQdBQ&s`);
    if (adjustedLength > maxDescriptionLength) {
        embed.setFooter({text: "Você ultrapassou o limite de 32 caracteres, estarei cortando a mensagem.", iconURL: message.author.avatarURL()});
    }

    return message.reply({ embeds: [embed] });
};

exports.help = {
    name: 'sobremim',
    aliases: ['aboutme', 'sobre', 'sb'],
    description: 'Atualize sua descrição pessoal. Usage: {prefixo}sobremim <descrição>',
    status: false
};
