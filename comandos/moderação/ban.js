const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status == false) return message.reply({ content: "Este comando está em manutenção!" });

    if (!message.member.permissions.has('BAN_MEMBERS')) return message.reply("Você não tem permissão para banir membros.");
    if (!message.guild.me.permissions.has('BAN_MEMBERS')) return message.reply("Eu não tenho permissão para banir membros.");

    let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!member && args.length > 0) {
        const usernameOrDisplayName = args.join(' ');
        member = message.guild.members.cache.find(u => u.user.username.toLowerCase() === usernameOrDisplayName.toLowerCase() || `${u.user.username.toLowerCase()}#${u.user.discriminator}` === usernameOrDisplayName.toLowerCase());
    }

    if (!member) return message.reply("Você deve mencionar um usuário válido para banir.");

    const duration = args[1];
    const reason = args.slice(2).join(" ") || "Nenhuma razão fornecida";

    if (!duration || isNaN(duration)) {
        // Banimento permanente
        try {
            await member.ban({ reason });
        } catch (e) {
            return message.reply({content: "Parece que o usuário possue um cargo superior ao meu..."})
        }
        
        const embed = new Discord.EmbedBuilder()
            .setTitle("Usuário Banido")
            .setColor(client.cor)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: "Usuário", value: `${member.user.tag} (${member.id})`, inline: true },
                { name: "Moderador", value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: "Motivo", value: reason },
                { name: "Duração", value: "Permanente" }
            )
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }

    // Banimento temporário
    try {
        await member.ban({ reason });
    } catch (e) {
        return message.reply({content: "Parece que o usuário possue um cargo superior ao meu..."})
    }

    const embed = new Discord.EmbedBuilder()
        .setTitle("Usuário Temporariamente Banido")
        .setColor(client.cor)
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
            { name: "Usuário", value: `${member.user.tag} (${member.id})`, inline: true },
            { name: "Moderador", value: `${message.author.tag} (${message.author.id})`, inline: true },
            { name: "Motivo", value: reason },
            { name: "Duração", value: `${duration} minutos` }
        )
        .setTimestamp();

    message.reply({ embeds: [embed] });
    await db.set(`tempban_${member.id}`, {
        guildId: message.guild.id,
        endTime: Date.now() + duration * 60 * 1000 // Tempo de expiração
    });
    
};

exports.help = {
    name: "ban",
    aliases: [],
    description: "Bane um membro do servidor, com suporte para banimentos temporários. {prefixo}ban <@user> [tempo]",
    status: false,
    checkExpiredBansAndMutes: checkExpiredBansAndMutes
};

async function checkExpiredBansAndMutes() {
    try {
        // Verificar e remover tempbans expirados
        const tempbans = await db.all(); // Obtenha todos os dados
        if (!Array.isArray(tempbans)) {
            console.error('O retorno de db.all() não é um array.');
            return;
        }

        for (const data of tempbans) {
            if (data && data.key && data.key.startsWith('tempban_')) {
                const banData = data.value;
                if (Date.now() > banData.endTime) {
                    try {
                        const guild = client.guilds.cache.get(banData.guildId);
                        if (guild) {
                            const member = await guild.members.fetch(banData.userId);
                            await guild.members.unban(member.id, "Tempban expirado");
                            
                            const unbanEmbed = new Discord.EmbedBuilder()
                                .setTitle("Usuário Desbanido")
                                .setColor(client.cor)
                                .setThumbnail(member.user.displayAvatarURL())
                                .addFields(
                                    { name: "Usuário", value: `${member.user.tag} (${member.id})`, inline: true },
                                    { name: "Motivo", value: "Tempban expirado" }
                                );

                            const channel = await guild.channels.fetch('ID_DO_CANAL_DE_LOGS'); // Substitua pelo ID do canal de logs
                            channel.send({ embeds: [unbanEmbed] });

                            await db.delete(data.key); // Remover do banco de dados
                        }
                    } catch (error) {
                        console.error(`Erro ao remover tempban: ${error}`);
                    }
                }
            }
        }

        
        const mutes = await db.all(); 
        if (!Array.isArray(mutes)) {
            console.error('O retorno de db.all() não é um array.');
            return;
        }

        for (const data of mutes) {
            if (data && data.key && data.key.startsWith('tempmute_')) {
                const muteData = data.value;
                if (Date.now() > muteData.endTime) {
                    try {
                        const guild = client.guilds.cache.get(muteData.guildId);
                        if (guild) {
                            const member = await guild.members.fetch(muteData.userId);
                            const muteRole = guild.roles.cache.get(muteData.roleId);

                            if (member && muteRole) {
                                await member.roles.remove(muteRole);

                                const unmuteEmbed = new Discord.EmbedBuilder()
                                    .setTitle("Usuário Desmutado")
                                    .setColor(client.cor)
                                    .setThumbnail(member.user.displayAvatarURL())
                                    .addFields(
                                        { name: "Usuário", value: `${member.user.tag} (${member.id})`, inline: true },
                                        { name: "Motivo", value: "Tempmute expirado" }
                                    );

                                const channel = await guild.channels.fetch('ID_DO_CANAL_DE_LOGS'); // Substitua pelo ID do canal de logs
                                channel.send({ embeds: [unmuteEmbed] });

                                await db.delete(data.key); // Remover do banco de dados
                            }
                        }
                    } catch (error) {
                        console.log(`Erro ao remover tempmute: ${error}`);
                    }
                }
            }
        }
    } catch (error) {
        console.log(`Erro na função checkExpiredBansAndMutes: ${error}`);
    }
}