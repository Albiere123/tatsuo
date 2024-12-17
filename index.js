const Discord = require("discord.js")
const d = Discord.GatewayIntentBits
const client = new Discord.Client({
    intents: [
        d.AutoModerationConfiguration, d.AutoModerationExecution,
        d.DirectMessagePolls, d.DirectMessageReactions, d.DirectMessageTyping,
        d.DirectMessages, d.GuildEmojisAndStickers, d.GuildIntegrations,
        d.GuildInvites, d.GuildMembers, d.GuildMessagePolls, d.GuildMessageReactions,
        d.GuildMessageTyping, d.GuildMessages, d.GuildModeration, d.GuildPresences,
        d.GuildScheduledEvents, d.GuildVoiceStates, d.GuildWebhooks, d.Guilds,
        d.MessageContent
    ]
})
client.on("ready", () => {
    console.log("Ligado!")
})


client.on("messageCreate", async (message) => {
    if(message.channel.type == Discord.ChannelType.DM) return;
    if(message.member.bot) return;
})


client.login(process.env.TOKEN)