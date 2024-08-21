const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const status = true;

exports.run = async(client, message, args) => {
    if(message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"});

    // Obtém o objeto `dashboard` do banco de dados, ou inicializa como um objeto vazio
    let dashboard = await db.get(`dashboard.${message.guild.id}.canais`) || {};

    // Verifica se o comando é para configurar um canal específico (confess, logs, etc.)
    if(args[0]) {
        const validChannels = ['confess', 'logs']; // Adicione mais funções de canais conforme necessário
        const channelType = args[0].toLowerCase();

        if(!validChannels.includes(channelType)) {
            return message.reply({content: "Tipo de canal inválido. Use um dos seguintes: `confess`, `logs`."});
        }

        if(args[1] == "delete") {
            delete dashboard[channelType]; // Remove o canal do tipo específico do dashboard
            await db.set(`dashboard.${message.guild.id}.canais`, dashboard);
            return message.reply({content: `O canal ${channelType} foi removido do dashboard.`});
        }

        // Verifica se um canal foi mencionado ou se um ID foi fornecido
        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
        
        if(!channel) {
            return message.reply({content: "Você precisa mencionar um canal ou fornecer um ID válido."});
        }

        // Salva o canal no banco de dados para o tipo específico
        dashboard[channelType] = {
            id: channel.id,
            mod: message.author.id // Salva quem setou o canal
        };
        await db.set(`dashboard.${message.guild.id}.canais`, dashboard);

        return message.reply({content: `Canal de ${channelType} configurado para ${channel}!`});

    } else {
        // Obtém as configurações de todos os canais configurados ou inicializa como "Nenhum"
        let confessChannel = dashboard.confess || { id: "Nenhum.", mod: "N/A" };
        let logsChannel = dashboard.logs || { id: "Nenhum.", mod: "N/A" };

        // Formatação dos IDs dos canais
        let confess = confessChannel.id != "Nenhum." ? `<#${confessChannel.id}>` : "Nenhum.";
        let logs = logsChannel.id != "Nenhum." ? `<#${logsChannel.id}>` : "Nenhum.";

        let main = new Discord.EmbedBuilder()
            .setDescription(`# <:cnfg:820694104206737428> | DashBoard`)
            .addFields([
                { name: "<:sla:820694183811612732> Canal de Confissão <:seta2:966325688745484338>", value: `${confess} (Staff que setou: <@${confessChannel.mod}>)` },
                { name: "<:sla:820694183811612732> Canal de Logs <:seta2:966325688745484338>", value: `${logs} (Staff que setou: <@${logsChannel.mod}>)` }
            ])
            .setColor(client.cor)
            .setThumbnail(message.guild.iconURL());

        message.reply({embeds: [main]});
    }
};

exports.help = {
    name: "dashboard",
    aliases: [],
    description: "Faça alterações nas opções setáveis do bot!",
    status: status
};
