const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    try {
        const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
        if (message.author.id !== client.dev.id && status == false) 
            return message.reply({ content: "Este comando está em manutenção!" });

        let embed = new Discord.EmbedBuilder();
        let dashboard = await db.get(`dashboard.${message.guild.id}.canais`) || {};

        if (args[0]) {
            if (message.author.id != client.dev.id && !message.guild.members.cache.get(message.author.id).permissions.has(Discord.PermissionFlagsBits.ManageGuild)) 
                return message.reply("Você precisa da permissão `MANAGE GUILD`");

            const validChannels = ['confess', 'logs', 'sorteios', 'muterole'];
            const channelType = args[0].toLowerCase();

            if (!validChannels.includes(channelType)) {
                client.setError(embed, "Tipo de canal inválido. Use um dos seguintes: `confess`, `logs`, `sorteios`, `muterole`.");
                client.setUsage(embed, `${client.prefix}dashboard <confess/logs/sorteios/muterole> <#canal/ID do canal>`);
                return message.reply({ embeds: [embed] });
            }

            if (channelType === "muterole") {
                const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
                if (!role) {
                    client.setError(embed, "Você precisa mencionar um cargo válido ou fornecer um ID válido.");
                    client.setUsage(embed, `${client.prefix}dashboard muterole <@cargo/ID do cargo>`);
                    return message.reply({ embeds: [embed] });
                }

                dashboard.muterole = {
                    id: role.id,
                    mod: message.author.id
                };
                await db.set(`dashboard.${message.guild.id}.canais`, dashboard);
                return message.reply({ content: `Cargo de mute configurado para ${role}!` });
            }

            let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);

            if (!channel || channel.type !== Discord.ChannelType.GuildText) {  
                client.setError(embed, "Você precisa mencionar um canal de texto válido ou fornecer um ID válido.");
                client.setUsage(embed, `${client.prefix}dashboard <confess/logs/sorteios> <#canal/ID do canal>`);
                return message.reply({ embeds: [embed] });
            }

            if (args[2] === "delete") {
                delete dashboard[channelType];
                await db.set(`dashboard.${message.guild.id}.canais`, dashboard);
                return message.reply({ content: `O canal ${channelType} foi removido do dashboard.` });
            }

            dashboard[channelType] = {
                id: channel.id,
                mod: message.author.id 
            };
            await db.set(`dashboard.${message.guild.id}.canais`, dashboard);

            return message.reply({ content: `Canal de ${channelType} configurado para ${channel}!` });

        } else {
            let confessChannel = dashboard.confess || { id: "Nenhum.", mod: "N/A" };
            let logsChannel = dashboard.logs || { id: "Nenhum.", mod: "N/A" };
            let sorteioChannel = dashboard.sorteios || { id: "Nenhum.", mod: "N/A" };
            let muterole = dashboard.muterole || { id: "Nenhum.", mod: "N/A" };

            let confess = confessChannel.id !== "Nenhum." ? `<#${confessChannel.id}>` : "Nenhum.";
            let logs = logsChannel.id !== "Nenhum." ? `<#${logsChannel.id}>` : "Nenhum.";
            let sorteio = sorteioChannel.id !== "Nenhum." ? `<#${sorteioChannel.id}>` : "Nenhum.";
            let muteRole = muterole.id !== "Nenhum." ? `<@&${muterole.id}>` : "Nenhum.";

            let main = new Discord.EmbedBuilder()
                .setDescription(`# <:cnfg:820694104206737428> | DashBoard`)
                .addFields([
                    { name: "<:avaliacao:1275831072554356918> Canal de Confissão <:seta2:966325688745484338>", value: `${confess} (Staff que setou: <@${confessChannel.mod}>)` },
                    { name: "<:batepapo:1275650282616918068> Canal de Logs <:seta2:966325688745484338>", value: `${logs} (Staff que setou: <@${logsChannel.mod}>)` },
                    { name: "<:celebracao:1277780212368539698> Canal de Sorteios <:seta2:966325688745484338>", value: `${sorteio} (Staff que setou: <@${sorteioChannel.mod}>)` },
                    { name: "<:mute:1277780212368539698> Cargo de Mute <:seta2:966325688745484338>", value: `${muteRole} (Staff que setou: <@${muterole.mod}>)` }
                ])
                .setColor(client.cor)
                .setFooter({ text: "Configure os canais conforme o exemplo: `dashboard confess <#novo canal>`", iconURL: client.user.avatarURL() })
                .setThumbnail(message.guild.iconURL());

            return message.reply({ embeds: [main] });
        }
    } catch (error) {
        client.setError(error, `Erro ao executar o comando ${this.help.name}`);
        message.reply({ content: "Ocorreu um erro ao tentar executar este comando. O erro foi registrado e será analisado." });
    }
};

exports.help = {
    name: "dashboard",
    aliases: [],
    description: "Faça alterações nas opções setáveis do bot! Usage: dashboard <confess/logs/sorteios/muterole> <#canal/ID do canal>",
    status: false
};
