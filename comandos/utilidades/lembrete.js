const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();


exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status === false) return message.reply({ content: "Este comando está em manutenção!" });

    let embed = new Discord.EmbedBuilder();
    let timeString = args[0];
    let reminderMessage = args.slice(1).join(' ');
    let channelId = message.channel.id;

    
    if (timeString === "list") {
        const reminders = await db.get('reminders') || [];
        const userReminders = reminders.filter(reminder => reminder.user_id === message.author.id);

        if (userReminders.length === 0) {
            embed
                .setDescription(`# <:notificacao:1275650250740072581> Lembretes
Você não tem lembretes programados.`)
                .setThumbnail('https://cdn-icons-png.flaticon.com/512/3964/3964959.png')
                .setColor(client.cor);
            return message.channel.send({ embeds: [embed] });
        }

       
        const allReminders = userReminders.map((reminder, index) => {
            let formattedTime = formatTime(reminder.remind_at - Date.now());
            if(formattedTime < 0 || !formattedTime) formattedTime = "Esperando a proxima verificação..."
            return `**Lembrete Nº${index + 1}:** ${reminder.reminder_message}\n**Tempo restante:** ${formattedTime}`;
        });

        embed
            .setDescription(`# <:notificacao:1275650250740072581> Lembretes
ㅤ              
${allReminders.join('\n\n')}`)
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/3964/3964959.png')
            .setColor(client.cor);
        return message.channel.send({ embeds: [embed] });
    }
    if (!timeString) {
        client.setError(embed, `Parece que você não especificou o tempo.. exemplo: 10h10m10s`);
        client.setUsage(embed, `${client.prefix}lembrete <tempo | list> <mensagem>`);
        return message.channel.send({ embeds: [embed] });
    }
    if(isNaN(args[0].replace("m", "").replace("h", "").replace("s", ""))) {
        client.setError(embed, `Parece que está tentando usar algo que não seja um formato de tempo...`)
        client.setUsage(embed, `${client.prefix}lembrete <tempo> <mensagem>`)
        return message.reply({embeds: [embed]})
    }
    if (!reminderMessage) {
        client.setError(embed, `Parece que você não especificou a mensagem...`);
        client.setUsage(embed, `${client.prefix}lembrete <tempo> <mensagem>`);
        return message.channel.send({ embeds: [embed] });
    }

    const time = parseTime(timeString);

    if (time === null) {
        client.setError(embed, `Parece que você não colocou o tempo corretamente.. exemplo: 10h10m10s | 45s | 1m | 3h`);
        return message.channel.send({ embeds: [embed] });
    }

    const remindAt = Date.now() + time;

    const reminders = await db.get('reminders') || [];
    reminders.push({
        user_id: message.author.id,
        reminder_message: reminderMessage,
        remind_at: remindAt,
        channel_id: channelId
    });
    db.set('reminders', reminders);

    function formatTimeString(timeString) {
        return timeString
            .replace(/(\d+)h/g, (match, p1) => `${p1} hora${p1 > 1 ? 's ' : ''}`)
            .replace(/(\d+)m/g, (match, p1) => `${p1} minuto${p1 > 1 ? 's ' : ''}`)
            .replace(/(\d+)s/g, (match, p1) => `${p1} segundo${p1 > 1 ? 's ' : ''}`)
            .replace(/(\d+h)?(\d+m)?(\d+s)?/, (match, h, m, s) => 
                `${h ? h.replace(/h/, 'hora ') : ''} ${m ? m.replace(/m/, 'minuto ') : ''} ${s ? s.replace(/s/, 'segundo ') : ''}`
            );
    }

    const formattedTimeString = formatTimeString(timeString);

    const embe = new Discord.EmbedBuilder()
        .setDescription(`# <:notificacao:1275650250740072581> Lembrete Configurado\n`+
            `**\n<:verifica:1275650252803932251> Eu vou te lembrar em:**\n` +
            `**${formattedTimeString}**\n\n` +
            `**<:alarme:1275650257673388062> Mensagem programada:**\n` +
            `\`${reminderMessage}\``
        )
        .setColor(client.cor)
        .setThumbnail(`https://cdn-icons-png.flaticon.com/512/3964/3964959.png`);

    message.channel.send({ embeds: [embe] });
};

function parseTime(timeString) {
    const timePattern = /(\d+)([hms])/g;
    let match;
    let totalMilliseconds = 0;

    while ((match = timePattern.exec(timeString)) !== null) {
        const value = parseInt(match[1]);
        const unit = match[2];

        if (isNaN(value) || value <= 0) return null;

        switch (unit) {
            case 'h':
                totalMilliseconds += value * 60 * 60 * 1000;
                break;
            case 'm':
                totalMilliseconds += value * 60 * 1000;
                break;
            case 's':
                totalMilliseconds += value * 1000;
                break;
        }
    }

    return totalMilliseconds > 0 ? totalMilliseconds : null;
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const formattedHours = hours > 0 ? `${hours}h ` : '';
    const formattedMinutes = minutes % 60 > 0 ? `${minutes % 60}m ` : '';
    const formattedSeconds = seconds % 60 > 0 ? `${seconds % 60}s` : '';

    return `${formattedHours}${formattedMinutes}${formattedSeconds}`.trim();
}

async function checkReminders(client) {
    const reminders = await db.get('reminders') || [];
    const now = Date.now();
    const updatedReminders = reminders.filter(reminder => {
        if (reminder.remind_at <= now) {
            const channel = client.channels.cache.get(reminder.channel_id);
            if (channel) {
                try {
                    let embed = new Discord.EmbedBuilder()
                        .setDescription(`# **<:notificacao:1275650250740072581> Lembrete**
**<:alarme:1275650257673388062> Mensagem programada:** \`${reminder.reminder_message}\``)
                        .setThumbnail(`https://cdn-icons-png.flaticon.com/512/3964/3964959.png`)
                        .setColor(client.cor);
                    channel.send({ content: `<@${reminder.user_id}>`, embeds: [embed] })
                        .catch(error => console.error('Erro ao enviar mensagem para o canal:', error));
                } catch (error) {
                    console.error('Erro ao enviar mensagem para o canal:', error);
                }
            } else {
                console.error('Canal não encontrado para o lembrete:', reminder.channel_id);
            }
            return false; 
        }
        return true; 
    });

    db.set('reminders', updatedReminders);
}

exports.help = {
    name: "lembrete",
    aliases: ["remindder"],
    description: "Deixe me lhe lembrar de algo! Usage: {prefixo}lembrete <tempo | list -> lista de lembretes> <mensagem programada>",
    status: false,
    run: exports.run,
    checkReminders: checkReminders,
};
