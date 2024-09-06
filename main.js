const Discord = require("discord.js");
const { GatewayIntentBits, ActivityType } = require("discord.js");
const axios = require('axios');
require('dotenv').config();
const config = require('./config.json');
const fs = require("fs");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { PermissionsBitField, ChannelType } = require('discord.js'); 
const CustomDB = require('./database');
const botdb = new CustomDB();
const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessagePolls,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildScheduledEvents,
    ]
});
client.cor = config.cor;
client.comandos = new Discord.Collection();
client.aliases = new Discord.Collection();
client.setUsage = setUsage;
client.setError = setError;
client.get = get;
client.set = set;
client.perms = verificarPermissoes;
client.db = botdb;
client.allPerms = [
    PermissionsBitField.Flags.CreateInstantInvite, 
    PermissionsBitField.Flags.KickMembers, 
    PermissionsBitField.Flags.BanMembers, 
    PermissionsBitField.Flags.Administrator, 
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.ManageGuild, 
    PermissionsBitField.Flags.AddReactions, 
    PermissionsBitField.Flags.ViewAuditLog, 
    PermissionsBitField.Flags.PrioritySpeaker, 
    PermissionsBitField.Flags.Stream,
    PermissionsBitField.Flags.ViewChannel, 
    PermissionsBitField.Flags.SendMessages, 
    PermissionsBitField.Flags.SendTTSMessages, 
    PermissionsBitField.Flags.ManageMessages, 
    PermissionsBitField.Flags.AttachFiles, 
    PermissionsBitField.Flags.ReadMessageHistory,
    PermissionsBitField.Flags.MentionEveryone,
    PermissionsBitField.Flags.UseExternalEmojis, 
    PermissionsBitField.Flags.ViewGuildInsights, 
    PermissionsBitField.Flags.ChangeNickname,
    PermissionsBitField.Flags.ManageNicknames, 
    PermissionsBitField.Flags.ManageRoles,
    PermissionsBitField.Flags.ManageWebhooks,
    PermissionsBitField.Flags.ManageEmojisAndStickers, 
    PermissionsBitField.Flags.UseApplicationCommands,
    PermissionsBitField.Flags.RequestToSpeak, 
    PermissionsBitField.Flags.ManageEvents, 
    PermissionsBitField.Flags.ManageThreads, 
    PermissionsBitField.Flags.CreatePublicThreads, 
    PermissionsBitField.Flags.CreatePrivateThreads, 
    PermissionsBitField.Flags.UseExternalStickers, 
    PermissionsBitField.Flags.SendMessagesInThreads, 
    PermissionsBitField.Flags.UseEmbeddedActivities, 
    PermissionsBitField.Flags.ModerateMembers, 
    PermissionsBitField.Flags.UseSoundboard, 
    PermissionsBitField.Flags.CreateGuildExpressions, 
    PermissionsBitField.Flags.CreateEvents, 
    PermissionsBitField.Flags.UseExternalSounds, 
    PermissionsBitField.Flags.SendPolls 
];

async function getRequiredPermissions(command, client, message, args) {
    const permissions = new Set();
    
    const commandCode = command.run.toString(); 

   
    if (/\.send\(/.test(commandCode)) {
        permissions.add(PermissionsBitField.Flags.SendMessages);
    }
    if (/\.embed/.test(commandCode) || /\.setEmbed/.test(commandCode) || /embedLinks/.test(commandCode) || /\.embedLinks/.test(commandCode)) {
        permissions.add(PermissionsBitField.Flags.EmbedLinks);
    }
    if (/\.addReaction/.test(commandCode) || /\.react/.test(commandCode) || /addReaction/.test(commandCode)) {
        permissions.add(PermissionsBitField.Flags.AddReactions);
    }
    if (/\.createCollector/.test(commandCode) || /\.createMessageComponentCollector/.test(commandCode) || /createCollector/.test(commandCode)) {
        permissions.add(PermissionsBitField.Flags.ManageMessages);
    }
    if (/\.setEmoji/.test(commandCode) || /setEmoji/.test(commandCode)) {
        permissions.add(PermissionsBitField.Flags.UseExternalEmojis);
    }
    if (/\.connect/.test(commandCode) || /\.join/.test(commandCode)) {
        if (message.channel.type === ChannelType.GuildVoice) {
            permissions.add(PermissionsBitField.Flags.Connect);
        } 
    }
    if (/\.speak/.test(commandCode)) {
        if (message.channel.type === ChannelType.GuildVoice) {
            permissions.add(PermissionsBitField.Flags.Speak);
        } 
    }
    if (/\.priority/.test(commandCode)) {
        permissions.add(PermissionsBitField.Flags.MuteMembers);
    }
    if (/\.kick/.test(commandCode) || /\.ban/.test(commandCode)) {
        permissions.add(PermissionsBitField.Flags.KickMembers);
        permissions.add(PermissionsBitField.Flags.BanMembers);
    }
    if(/\.mute/.test(commandCode)) {
        permissions.add(PermissionFlagsBits.MuteMembers)
    }
    if (/\.manageChannels/.test(commandCode)) {
        permissions.add(PermissionFlagsBits.ManageChannels);
    }
    

    
    const botPermissions = message.channel.permissionsFor(message.guild.members.me);

    
    const botPermissionsArray = botPermissions.toArray();

    
    const missingPermissions = Array.from(permissions).filter(perm => !botPermissionsArray.includes(perm));
    return missingPermissions;
}



const { PermissionFlagsBits } = require('discord.js');

const permissionValues = {
    [PermissionFlagsBits.CreateInstantInvite]: PermissionFlagsBits.CreateInstantInvite,
    [PermissionFlagsBits.KickMembers]: PermissionFlagsBits.KickMembers,
    [PermissionFlagsBits.BanMembers]: PermissionFlagsBits.BanMembers,
    [PermissionFlagsBits.Administrator]: PermissionFlagsBits.Administrator,
    [PermissionFlagsBits.ManageChannels]: PermissionFlagsBits.ManageChannels,
    [PermissionFlagsBits.ManageGuild]: PermissionFlagsBits.ManageGuild,
    [PermissionFlagsBits.AddReactions]: PermissionFlagsBits.AddReactions,
    [PermissionFlagsBits.ViewAuditLog]: PermissionFlagsBits.ViewAuditLog,
    [PermissionFlagsBits.PrioritySpeaker]: PermissionFlagsBits.PrioritySpeaker,
    [PermissionFlagsBits.Stream]: PermissionFlagsBits.Stream,
    [PermissionFlagsBits.ViewChannel]: PermissionFlagsBits.ViewChannel,
    [PermissionFlagsBits.SendMessages]: PermissionFlagsBits.SendMessages,
    [PermissionFlagsBits.SendTTSMessages]: PermissionFlagsBits.SendTTSMessages,
    [PermissionFlagsBits.ManageMessages]: PermissionFlagsBits.ManageMessages,
    [PermissionFlagsBits.EmbedLinks]: PermissionFlagsBits.EmbedLinks,
    [PermissionFlagsBits.AttachFiles]: PermissionFlagsBits.AttachFiles,
    [PermissionFlagsBits.ReadMessageHistory]: PermissionFlagsBits.ReadMessageHistory,
    [PermissionFlagsBits.MentionEveryone]: PermissionFlagsBits.MentionEveryone,
    [PermissionFlagsBits.UseExternalEmojis]: PermissionFlagsBits.UseExternalEmojis,
    [PermissionFlagsBits.ViewGuildInsights]: PermissionFlagsBits.ViewGuildInsights,
    [PermissionFlagsBits.Connect]: PermissionFlagsBits.Connect,
    [PermissionFlagsBits.Speak]: PermissionFlagsBits.Speak,
    [PermissionFlagsBits.MuteMembers]: PermissionFlagsBits.MuteMembers,
    [PermissionFlagsBits.DeafenMembers]: PermissionFlagsBits.DeafenMembers,
    [PermissionFlagsBits.MoveMembers]: PermissionFlagsBits.MoveMembers,
    [PermissionFlagsBits.UseVAD]: PermissionFlagsBits.UseVAD,
    [PermissionFlagsBits.ChangeNickname]: PermissionFlagsBits.ChangeNickname,
    [PermissionFlagsBits.ManageNicknames]: PermissionFlagsBits.ManageNicknames,
    [PermissionFlagsBits.ManageRoles]: PermissionFlagsBits.ManageRoles,
    [PermissionFlagsBits.ManageWebhooks]: PermissionFlagsBits.ManageWebhooks,
    [PermissionFlagsBits.ManageEmojisAndStickers]: PermissionFlagsBits.ManageEmojisAndStickers,
    [PermissionFlagsBits.UseApplicationCommands]: PermissionFlagsBits.UseApplicationCommands,
    [PermissionFlagsBits.RequestToSpeak]: PermissionFlagsBits.RequestToSpeak,
    [PermissionFlagsBits.ManageThreads]: PermissionFlagsBits.ManageThreads,
    [PermissionFlagsBits.UsePublicThreads]: PermissionFlagsBits.UsePublicThreads,
    [PermissionFlagsBits.UsePrivateThreads]: PermissionFlagsBits.UsePrivateThreads,
    [PermissionFlagsBits.UseExternalStickers]: PermissionFlagsBits.UseExternalStickers,
    [PermissionFlagsBits.SendMessagesInThreads]: PermissionFlagsBits.SendMessagesInThreads,
    [PermissionFlagsBits.StartEmbeddedActivities]: PermissionFlagsBits.StartEmbeddedActivities,
    [PermissionFlagsBits.ModerateMembers]: PermissionFlagsBits.ModerateMembers
};
function getPermissionFlag(value) {
    
    for (const [bitfieldValue, permission] of Object.entries(permissionValues)) {
        if (BigInt(bitfieldValue) === value) {
            return permission;
        }
    }
    return null;
}



fs.readdirSync(`./comandos/`).forEach((local) => {
    if (!local) return;
    let arquivos = fs.readdirSync(`./comandos/${local}`).filter(arquivo => arquivo.endsWith('.js'));
    for (let f of arquivos) {
        const file = require(`./comandos/${local}/${f}`);
        if (!file || !file.help.name || !file.help.aliases) {
            console.log(`Comando ${f} está sem nome ou aliases!`);
            continue;
        }
        console.log(`O comando ${f} foi iniciado.`);
        client.comandos.set(file.help.name, file);
        file.help.aliases.forEach(x => client.aliases.set(x, file.help.name));
    }
});

function gerarEmbed(titulo, descricao, thumbnail, footer, imagem, cor) {
    const embed = new Discord.EmbedBuilder();

    if (titulo) {
        embed.setTitle(titulo);
    }

    if (descricao) {
        embed.setDescription(descricao);
    }

    if (thumbnail) {
        embed.setThumbnail(thumbnail);
    }

    if (footer) {
        embed.setFooter(footer);
    }

    if (imagem) {
        embed.setImage(imagem);
    }
    if (cor) {
        embed.setColor(cor);
    }

    return embed;
}

client.on("messageCreate", async message => {
    
    if (message.author.bot || message.channel.type == Discord.ChannelType.DM) return; 
    let c = await db.get(`${message.guild.id}.config`)
    
    client.prefix = c?.prefix || config.prefix;
    
    if(message.content.startsWith(`<@${client.user.id}>`) || message.content.startsWith(`<@!${client.user.id}>`)) {
        let embed = new Discord.EmbedBuilder()
        .setDescription(`# <:coracao:966744213981126807> | Mini Ajuda
ㅤ
ㅤㅤBem vindo! Sou o ${client.user.username}, um bot focado na diversão e utilidade para os usuários!
ㅤ
**( <:disquete:966745064669839420> ) Prefixo:** ${client.prefix}`)
        .setColor(client.cor)
        .setThumbnail(client.user.avatarURL({size: 2048, extension: "png"}))
        message.reply({embeds: [embed]}).catch(e => console.log(e))
    }

    if (message.content.startsWith(client.prefix)) {

        let args = message.content.slice(client.prefix.length).trim().split(/ +/g);
        let cmd = args.shift().toLowerCase();

        let comando = client.comandos.get(cmd) || client.comandos.get(client.aliases.get(cmd));

        if (comando) { 
            const requiredPermissions = await getRequiredPermissions(comando, client, message, args);
    
            if (!Array.isArray(requiredPermissions)) {
                console.error('requiredPermissions não é um array:', requiredPermissions);
                return;
            }
            let missingPermissions = []
            let perms = message.channel.permissionsFor(message.guild.members.cache.get(client.user.id))
            requiredPermissions.forEach(perm => {
                if(perm == Discord.PermissionFlagsBits.ManageMessages) return;
                if(!perms.has(perm)) missingPermissions.push(perm)
            });
            
           
            

            if (missingPermissions.length > 0) {
                return message.reply({
                    content: `Estou faltando as seguintes permissões para executar este comando: ${missingPermissions.map( perm => {
                        const permissionName = Object.keys(PermissionFlagsBits).find(key => PermissionFlagsBits[key] === perm);
                        return permissionName
                
                }).join(", ")}`
                });
            }
             try {
                await comando.run(client, message, args);
            } catch (e) {
                console.error(`Erro ao executar comando: ${e.message}`);
                message.reply({ content: `Erro: ${e.message}` });
            }
        } else {
            console.log(`Comando não encontrado: ${cmd}`);
            message.reply({ content: "Comando não encontrado." });
        }
        return; 
    }

    
    const rules = await db.get(`automod_rules_${message.guild.id}`);
    if (!rules) return;

    for (const rule of rules) {
        if (message.author.id === client.user.id) return;

        if (rule.type === "palavra" && message.content.includes(rule.value)) {
            let deletionStatus = true;
            try {
                await message.delete();
            } catch (e) {
                deletionStatus = false;
            }

            const deletionMessage = deletionStatus ? "Eu deletei" : "Eu tentei deletar";

            let infractionMessage = await message.channel.send(`${rule.type} proibida(o) detectada: \`${rule.value}\`. Mensagem deletada.`);
            setTimeout(() => infractionMessage.delete(), 120000);

            let embed = gerarEmbed(
                null,
                `# <:cracha:820694021487460352> | AutoMod\nO Usuário <@${message.author.id}> cometeu uma infração nas regras! ${rule.type} => ${rule.value}\n${deletionMessage} a mensagem.`,
                client.user.avatarURL({ size: 4096, extension: "png" }),
                { text: "Logs do auto-mod" },
                null,
                client.cor
            );

            const logChannelData = await db.get(`dashboard.${message.guild.id}.canais`);
            const logChannelId = logChannelData ? logChannelData.logs ? logChannelData.logs.id : null : null;
            const logChannel = logChannelId ? message.guild.channels.cache.get(logChannelId) : null;

            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }

            return;
        }

        if (rule.type === "link" && (message.content.includes("https://") || message.content.includes("http://"))) {
            let deletionStatus = true;
            let a = ``
            try {
                await message.delete();
            } catch (e) {
                deletionStatus = false;
            }
            if(deletionStatus == false) a = `Eu tentei deletar a mensagem, entretanto não consegui.`
            else a = `Mensagem deletada.`
            let infractionMessage = await message.channel.send(`${rule.type} proibida(o) detectada. Mensagem deletada.`);
            setTimeout(() => infractionMessage.delete(), 120000);

            let embed = gerarEmbed(
                null,
                `# <:cracha:820694021487460352> | AutoMod\nO Usuário <@${message.author.id}> cometeu uma infração nas regras! Link detectado.`,
                client.user.avatarURL({ size: 4096, extension: "png" }),
                { text: "Logs do auto-mod" },
                null,
                client.cor
            );

            const logChannelData = await db.get(`dashboard.${message.guild.id}.canais`);
            const logChannelId = logChannelData ? logChannelData.logs ? logChannelData.logs.id : null : null;
            const logChannel = logChannelId ? message.guild.channels.cache.get(logChannelId) : null;

            if (logChannel) {
                await logChannel.send({ embeds: [embed] });
            }
        }
    }
});

client.on("ready", async () => {
    console.log(`${client.user.displayName} Online.`);
    setInterval(async () => require("./comandos/economia/investimentos.js").help.atualizarInvestimentos(), 3600000);
    client.dev = await client.users.cache.get("722811981660291082")
    

    const a = require('./comandos/utilidades/lembrete.js');
    const b = require('./comandos/moderação/sorteio.js')
    setInterval(() => {
        a.help.checkReminders(client);
        b.help.iniciarColetores(client)
        require("./comandos/moderação/ban.js").help.checkExpiredBansAndMutes()
    }, 5000);

    const activities = [
        { name: `Vendo ${client.users.cache.size} usuários`, type: ActivityType.Watching },
    ];

    setInterval(() => {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        client.user.setPresence({
            status: "dnd",
            activities: [randomActivity]
        });
    }, 100000);
});

function setUsage(embed, usage) {
    if (!(embed instanceof Discord.EmbedBuilder)) return; 
    embed.addFields(
        { name: `<:batepapo:1275650282616918068> Expressão Correta <:seta2:966325688745484338>`, value: usage, inline: false }
    );
    embed.setDescription(`# <:bloquear:1275650261574094912> Ocorreu um erro!`)
    embed.setColor(client.cor);
    embed.setThumbnail(client.user.avatarURL({ size: 2048, extension: "png" }));
}

function setError(embed, error) {
    if (!(embed instanceof Discord.EmbedBuilder)) return; 
    embed.addFields({ name: `<:megafone:1275650267592790016> Mensagem de Erro <:seta2:966325688745484338>`, value: error }); 
    embed.setDescription(`# <:bloquear:1275650261574094912> Ocorreu um erro!`);
    embed.setColor(client.cor); 
    embed.setThumbnail(client.user.avatarURL({ size: 2048, extension: "png" }));
}


function set(s, r) {
    return db.set(`${s}`, r)
}

function get(s) {
    return db.get(`${s}`)

}

function verificarPermissoes(canal, cliente, perms) {
    if (!Array.isArray(perms)) throw new Error("Apenas arrays entram como `PERMS`");
    if (!(cliente instanceof Discord.Client)) throw new Error("Apenas CLIENT do discord entram como `CLIENTE`");
    if (typeof canal !== 'number') throw new Error("Apenas números entram como `CANAIS`");

    const permissoesNecessarias = perms || client.allPerms;
    const permissoesFaltantes = permissoesNecessarias.filter(permissao => !canal.permissionsFor(cliente.user).has(permissao));
    if (permissoesFaltantes.length > 0) {
    const permissoesNominais = permissoesFaltantes.map(permissao => {
        switch (permissao) {
            case Discord.PermissionFlagsBits.CreateInstantInvite: return 'Criar Convites Instantâneos';
            case Discord.PermissionFlagsBits.KickMembers: return 'Expulsar Membros';
            case Discord.PermissionFlagsBits.BanMembers: return 'Banir Membros';
            case Discord.PermissionFlagsBits.Administrator: return 'Administrador';
            case Discord.PermissionFlagsBits.ManageChannels: return 'Gerenciar Canais';
            case Discord.PermissionFlagsBits.ManageGuild: return 'Gerenciar Servidor';
            case Discord.PermissionFlagsBits.AddReactions: return 'Adicionar Reações';
            case Discord.PermissionFlagsBits.ViewAuditLog: return 'Visualizar Log de Auditoria';
            case Discord.PermissionFlagsBits.PrioritySpeaker: return 'Voz Prioritária';
            case Discord.PermissionFlagsBits.Stream: return 'Transmitir Vídeo';
            case Discord.PermissionFlagsBits.ViewChannel: return 'Ver Canal';
            case Discord.PermissionFlagsBits.SendMessages: return 'Enviar Mensagens';
            case Discord.PermissionFlagsBits.SendTTSMessages: return 'Enviar Mensagens de Texto-para-Fala';
            case Discord.PermissionFlagsBits.ManageMessages: return 'Gerenciar Mensagens';
            case Discord.PermissionFlagsBits.EmbedLinks: return 'Enviar Embeds';
            case Discord.PermissionFlagsBits.AttachFiles: return 'Anexar Arquivos';
            case Discord.PermissionFlagsBits.ReadMessageHistory: return 'Ler Histórico de Mensagens';
            case Discord.PermissionFlagsBits.MentionEveryone: return 'Mencionar Everyone';
            case Discord.PermissionFlagsBits.UseExternalEmojis: return 'Usar Emojis Externos';
            case Discord.PermissionFlagsBits.ViewGuildInsights: return 'Visualizar Insights do Servidor';
            case Discord.PermissionFlagsBits.Connect: return 'Conectar';
            case Discord.PermissionFlagsBits.Speak: return 'Falar';
            case Discord.PermissionFlagsBits.MuteMembers: return 'Silenciar Membros';
            case Discord.PermissionFlagsBits.DeafenMembers: return 'Ensurdecer Membros';
            case Discord.PermissionFlagsBits.MoveMembers: return 'Mover Membros';
            case Discord.PermissionFlagsBits.UseVAD: return 'Usar Detecção de Voz';
            case Discord.PermissionFlagsBits.ChangeNickname: return 'Alterar Apelido';
            case Discord.PermissionFlagsBits.ManageNicknames: return 'Gerenciar Apelidos';
            case Discord.PermissionFlagsBits.ManageRoles: return 'Gerenciar Cargos';
            case Discord.PermissionFlagsBits.ManageWebhooks: return 'Gerenciar Webhooks';
            case Discord.PermissionFlagsBits.ManageEmojisAndStickers: return 'Gerenciar Emojis e Figurinhas';
            case Discord.PermissionFlagsBits.UseApplicationCommands: return 'Usar Comandos de Aplicação';
            case Discord.PermissionFlagsBits.RequestToSpeak: return 'Solicitar para Falar';
            case Discord.PermissionFlagsBits.ManageThreads: return 'Gerenciar Tópicos';
            case Discord.PermissionFlagsBits.UsePublicThreads: return 'Usar Tópicos Públicos';
            case Discord.PermissionFlagsBits.UsePrivateThreads: return 'Usar Tópicos Privados';
            case Discord.PermissionFlagsBits.UseExternalStickers: return 'Usar Figurinhas Externas';
            case Discord.PermissionFlagsBits.SendMessagesInThreads: return 'Enviar Mensagens em Tópicos';
            case Discord.PermissionFlagsBits.StartEmbeddedActivities: return 'Iniciar Atividades Incorporadas';
            case Discord.PermissionFlagsBits.ModerateMembers: return 'Moderar Membros';
            default: return 'Permissão Desconhecida';
        }
        
        }).join(', ');
    }
    return permissoesNominais;
}



const messageCache = new Discord.Collection();
const timeWindow = 10 * 1000; 
const spamThreshold = 3; 
const i = {}; 

client.on('messageCreate', async (msg) => {
    let antraid = await db.get(`antiraid_${msg.guild.id}`);
    if (!antraid) return;
    if (msg.author.bot) return;
    if(client.user.id === msg.author.id) return;

    const userMessages = messageCache.get(msg.author.id) || [];
    const now = Date.now();

   
    userMessages.push({ content: msg.content, timestamp: now });

    
    const recentMessages = userMessages.filter(m => now - m.timestamp < timeWindow);

    
    messageCache.set(msg.author.id, recentMessages);

    
    const repeatedMessages = recentMessages.filter(m => m.content === msg.content);

    if (repeatedMessages.length >= spamThreshold) {
        try {
            await msg.member.timeout(8 * 60 * 60 * 1000, 'Raid de spam detectada: mensagens repetidas');
            msg.reply(`Usuário ${msg.author.tag} foi mutado por spam.`);
        } catch (error) {
            if (error.message.includes('Missing Permissions')) {
                
                if (!i[msg.member.id]) {
                    i[msg.member.id] = { amount: 0 };
                }

                if (i[msg.member.id].amount > 0) return;

                i[msg.member.id].amount++;

                return msg.channel.send(`Estou sem permissão para castigar este membro!`);
            } else {
                msg.reply(`Erro ao aplicar o timeout no usuário ${msg.author.tag}: ${error.message}`);
            }
        }
        messageCache.delete(msg.author.id);
    }
});



client.login(process.env.TOKEN);
