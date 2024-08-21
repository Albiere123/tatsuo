const Discord = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const status = true;

exports.run = async (client, message, args) => {
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
            client.setUsage(erro, `${client.prefix}sobremim <descrição curta>`);
            return message.reply({ embeds: [erro] });
        }
    }

    const newAbout = args.join(' ');
    if (!newAbout) {
        client.setError(erro, `Forneça uma descrição!`);
        client.setUsage(erro, `${client.prefix}sobremim <descrição>`);
        return message.reply({ embeds: [erro] });
    }

    if (newAbout.includes("\n") || newAbout.includes("\r")) {
        client.setError(erro, `Evite usar quebra de linha.`)
        client.setUsage(erro, `${client.prefix}setprefix <novo prefixo>`)
        return message.reply({embeds: [erro]}) 
    }
   
    const truncatedAbout = newAbout.length > maxDescriptionLength 
        ? newAbout.slice(0, maxDescriptionLength) + '...' 
        : newAbout;

    let oldAbout = (await db.get(userId))?.sb || 'Não definido';
    await db.set(`${userId}`, {money: (await db.get(userId))?.money, sb: truncatedAbout});
    await db.set(`sobremim_${userId}_timestamp`, now.toISOString());

    let embed = new Discord.EmbedBuilder()
        .setDescription(`# <:prancheta:966765505069326387> | Sobremim
ㅤ
**( <:oemail1:966765165980811314> ) Antiga descrição:** ${oldAbout}
ㅤ
**( <:estrela:966742154863079424> ) Nova descrição:** ${truncatedAbout}
ㅤ`)
        .setColor(client.cor)
        .setThumbnail("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd_JI5ApY2ZwutFAjg-ELaP_Af6bIHSKQdBQ&s")
    if(maxDescriptionLength < newAbout) {
        embed.setFooter({text: "Você ultrapassou o limite de 32 caracteres, estarei cortando a mensagem.", iconURL: message.author.avatarURL()})
    }
    return message.reply({ embeds: [embed] });
};

exports.help = {
    name: 'sobremim',
    aliases: ['aboutme', 'sobre', 'sb'],
    description: 'Atualize sua descrição pessoal. Usage: {prefixo}sobremim <descrição>',
    status: status
};
