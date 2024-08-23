const Discord = require("discord.js");
const { GatewayIntentBits, ActivityType } = require("discord.js");
const axios = require('axios');
require('dotenv').config();
const config = require('./config.json');
const fs = require("fs");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

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
client.dev = null;
client.setUsage = setUsage;
client.setError = setError;


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
    client.dev = await client.users.cache.get("722811981660291082")
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
            } else {
                console.log("Canal de logs não definido. Mensagem de log não enviada.");
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

client.on("ready", () => {
    console.log(`${client.user.displayName} Online.`);

    setInterval(async () => {
        const allUsers = await db.all(); 
    
        for (let user of allUsers) {
            const userData = await db.get(`${user.id}`);
            if (!userData || !userData.investimentos) continue; 
    
            let novosInvestimentos = userData.investimentos.map(investimento => {
                let flutuacao;
                
                
                switch (investimento.tipo) {
                    case 'ações':
                        flutuacao = Math.random() * 0.2 - 0.1; 
                        break;
                    case 'imóveis':
                        flutuacao = Math.random() * 0.1 - 0.05; 
                        break;
                    case 'startups':
                        flutuacao = Math.random() * 0.4 - 0.2; 
                        break;
                    default:
                        flutuacao = 0;
                }
    
                
                investimento.retorno = Math.max(0, investimento.retorno + investimento.retorno * flutuacao).toFixed(2);
                return investimento;
            });
    
            
            await db.set(`${user.id}`, {
                ...userData,
                investimentos: novosInvestimentos
            });
        }
    }, 3600000);
    
    

    const a = require('./comandos/utilidades/lembrete.js');

    setInterval(() => a.help.checkReminders(client), 30000);

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

client.login(process.env.TOKEN);
