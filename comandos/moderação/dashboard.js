const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async(client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if(message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"});

   
    let dashboard = await db.get(`dashboard.${message.guild.id}.canais`) || {};

    
    if(args[0]) {
        const validChannels = ['confess', 'logs']; 
        const channelType = args[0].toLowerCase();

        if(!validChannels.includes(channelType)) {
            return message.reply({content: "Tipo de canal inválido. Use um dos seguintes: `confess`, `logs`."});
        }

        if(args[1] == "delete") {
            delete dashboard[channelType]; 
            await db.set(`dashboard.${message.guild.id}.canais`, dashboard);
            return message.reply({content: `O canal ${channelType} foi removido do dashboard.`});
        }

        
        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
        
        if(!channel) {
            return message.reply({content: "Você precisa mencionar um canal ou fornecer um ID válido."});
        }

        
        dashboard[channelType] = {
            id: channel.id,
            mod: message.author.id 
        };
        await db.set(`dashboard.${message.guild.id}.canais`, dashboard);

        return message.reply({content: `Canal de ${channelType} configurado para ${channel}!`});

    } else {
       
        let confessChannel = dashboard.confess || { id: "Nenhum.", mod: "N/A" };
        let logsChannel = dashboard.logs || { id: "Nenhum.", mod: "N/A" };

        
        let confess = confessChannel.id != "Nenhum." ? `<#${confessChannel.id}>` : "Nenhum.";
        let logs = logsChannel.id != "Nenhum." ? `<#${logsChannel.id}>` : "Nenhum.";

        let main = new Discord.EmbedBuilder()
            .setDescription(`# <:cnfg:820694104206737428> | DashBoard`)
            .addFields([
                { name: "<:avaliacao:1275831072554356918> Canal de Confissão <:seta2:966325688745484338>", value: `${confess} (Staff que setou: <@${confessChannel.mod}>)` },
                { name: "<:batepapo:1275650282616918068> Canal de Logs <:seta2:966325688745484338>", value: `${logs} (Staff que setou: <@${logsChannel.mod}>)` }
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
    status: false
};
