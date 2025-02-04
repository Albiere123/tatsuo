const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const db1 = new (require("../../database.js"))("Event-MemberAdd");
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

            const validChannels = ['confess', 'logs', 'sorteios', 'muterole', 'memberadd', "lang"];
            const channelType = args[0].toLowerCase();

            if (!validChannels.includes(channelType)) {

                await client.setError(message, embed, "Tipo de canal inválido. Use um dos seguintes: `confess`, `logs`, `sorteios`, `muterole`, `memberadd`.");
                await client.setUsage(message, embed, `${client.prefix}dashboard <confess/logs/sorteios/muterole/memberadd(categoria separada)> <#canal/ID do canal>`);
                return message.reply({ embeds: [embed] });
            }
            if(channelType === "lang") {
                const functions = require("../../functions.js")
                const language = args[1]?.toLowerCase();
                const supportedLanguages = ['en', 'pt', 'es']; 
                
                if (!supportedLanguages.includes(language)) {
                    return message.reply("teste");
                }
                
                
                await functions.setServerLanguage(message.guild.id, language);
                return message.reply(await functions.tradutor(await functions.getServerLanguage(message.guild.id), "langSet"));    
            };
                 
            if (channelType === "memberadd") {
                const guildSettings = (await db1.get(`${message.guild.id}`)) || {};
            
                if (args[1] === "canal") {
                    if (args[2]) {
                        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[2]);
                        if (!channel || channel.type !== Discord.ChannelType.GuildText) {
                            const embed = new Discord.EmbedBuilder()
                                .setColor(client.cor)
                                .setTitle("Erro")
                                .setDescription("Você precisa mencionar um canal de texto válido ou fornecer um ID válido.");

                            await client.setUsage(message, embed, `${client.prefix}dashboard memberadd canal <#canal/ID do canal>`);
                            return message.reply({ embeds: [embed] });
                        }
            
                        guildSettings.canal = channel.id;
                        await db1.set(`${message.guild.id}`, guildSettings);
            
                        const embed = new Discord.EmbedBuilder()
                            .setColor(client.cor)
                            .setTitle("Configuração Atualizada")
                            .setDescription(`Canal de boas-vindas configurado para ${channel}`);
                        return message.reply({ embeds: [embed] });
                    } else {
                        return message.reply("Mencione um canal ou envie um ID!");
                    }
                } else if (args[1] === "titulo") {
                    if (args[2]) {
                        const title = args.slice(2).join(" ");
                        guildSettings.titulo = title;
                        await db1.set(`${message.guild.id}`, guildSettings);
            
                        const embed = new Discord.EmbedBuilder()
                            .setColor(client.cor)
                            .setTitle("Configuração Atualizada")
                            .setDescription(`Título configurado como: **${title}**`);
                        return message.reply({ embeds: [embed] });
                    } else {
                        return message.reply("Forneça o título desejado!");
                    }
                } else if (args[1] === "descricao") {
                    if (args[2]) {
                        const description = args.slice(2).join(" ");
                        guildSettings.descricao = description;
                        await db1.set(`${message.guild.id}`, guildSettings);
            
                        const embed = new Discord.EmbedBuilder()
                            .setColor(client.cor)
                            .setTitle("Configuração Atualizada")
                            .setDescription(`Descrição configurada como: **${description}**`);
                        return message.reply({ embeds: [embed] });
                    } else {
                        return message.reply("Forneça a descrição desejada!");
                    }
                } else if (args[1] === "thumbnail") {
                    if (args[2]) {
                        const thumbnail = args[2];
                        guildSettings.thumbnail = thumbnail;
                        await db1.set(`${message.guild.id}`, guildSettings);
            
                        const embed = new Discord.EmbedBuilder()
                            .setColor(client.cor)
                            .setTitle("Configuração Atualizada")
                            .setDescription(`Thumbnail configurado como: [Link](${thumbnail})`);
                        return message.reply({ embeds: [embed] });
                    } else {
                        return message.reply("Forneça o link do thumbnail!");
                    }
                } else if (args[1] === "image") {
                    if (args[2]) {
                        const image = args[2];
                        guildSettings.image = image;
                        await db1.set(`${message.guild.id}`, guildSettings);
            
                        const embed = new Discord.EmbedBuilder()
                            .setColor(client.cor)
                            .setTitle("Configuração Atualizada")
                            .setDescription(`Imagem configurada como: [Link](${image})`);
                        return message.reply({ embeds: [embed] });
                    } else {
                        return message.reply("Forneça o link da imagem!");
                    }
                } else if (args[1] === "ligar") {
                    guildSettings.ligado = true;
                    await db1.set(`${message.guild.id}`, guildSettings);
            
                    const embed = new Discord.EmbedBuilder()
                        .setColor(client.cor)
                        .setTitle("Ativado")
                        .setDescription("Sistema de boas-vindas ativado com sucesso.");
                    return message.reply({ embeds: [embed] });
                } else if (args[1] === "desligar") {
                    guildSettings.ligado = false;
                    await db1.set(`${message.guild.id}`, guildSettings);
            
                    const embed = new Discord.EmbedBuilder()
                        .setColor(client.cor)
                        .setTitle("Desativado")
                        .setDescription("Sistema de boas-vindas desativado.");
                    return message.reply({ embeds: [embed] });
                } else {
                    const embed = new Discord.EmbedBuilder()
                    await client.setError(message, embed, "Comando inválido. Use ${client.prefix}dashboard memberadd <opção>.");
                    await client.setUsage(message, embed, `${client.prefix}dashboard memberadd canal, titulo, descricao, thumbnail, image, ligar, desligar`);

                    return message.reply({ embeds: [embed] });
                }
            }

            

            if (channelType === "muterole") {
                const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
                if (!role) {
                    await client.setError(message, embed, "Você precisa mencionar um cargo válido ou fornecer um ID válido.");
                    await client.setUsage(message, embed, `${client.prefix}dashboard muterole <@cargo/ID do cargo>`);
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
                await client.setError(message, embed, "Você precisa mencionar um canal de texto válido ou fornecer um ID válido.");
                await client.setUsage(message, embed, `${client.prefix}dashboard <confess/logs/sorteios> <#canal/ID do canal>`);
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
            let sistemaEntrada = (await db1.get(`${message.guild.id}`))?.ligado
            if(!sistemaEntrada) sistemaEntrada = false;
            let main = new Discord.EmbedBuilder()
                .setDescription(`# <:cnfg:820694104206737428> | DashBoard`)
                .addFields([
                    { name: "<:avaliacao:1275831072554356918> Canal de Confissão <:seta2:966325688745484338>", value: `${confess} (Staff que setou: <@${confessChannel.mod}>)` },
                    { name: "<:batepapo:1275650282616918068> Canal de Logs <:seta2:966325688745484338>", value: `${logs} (Staff que setou: <@${logsChannel.mod}>)` },
                    { name: "<:celebracao:1277780212368539698> Canal de Sorteios <:seta2:966325688745484338>", value: `${sorteio} (Staff que setou: <@${sorteioChannel.mod}>)` },
                    { name: "<:mute:1277780212368539698> Cargo de Mute <:seta2:966325688745484338>", value: `${muteRole} (Staff que setou: <@${muterole.mod}>)` },
                    { name: "<:adicionarusuario:1275650271929827440> Sistema de Entrada(memberadd) <:seta2:966325688745484338>", value: `${sistemaEntrada ? "Ligado!" : "Desligado!"}`}
                ])
                .setColor(client.cor)
                .setFooter({ text: "Configure os canais conforme o exemplo: `dashboard confess <#novo canal>`", iconURL: client.user.avatarURL() })
                .setThumbnail(message.guild.iconURL());

            return message.reply({ embeds: [main] });
        }
    } catch (error) {
        await client.setError(message, error, `Erro ao executar o comando ${this.help.name}`);
        message.reply({ content: "Ocorreu um erro ao tentar executar este comando. O erro foi registrado e será analisado." });
        console.log(`${error}`)
    }
};

exports.help = {
    name: "dashboard",
    aliases: [],
    description: "Faça alterações nas opções setáveis do bot! Usage: dashboard <confess/logs/sorteios/muterole> <#canal/ID do canal>",
    status: false
};
