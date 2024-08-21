const Discord = require("discord.js");
const axios = require("axios");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const status = true;

exports.run = async (client, message, args) => {
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    const startTime = Date.now();
    
    let apiPing;
    try {
        await axios.get("https://dbfd-api-tatsuo.glitch.me/")
            .then(() => {
                apiPing = Date.now() - startTime;
            });
    } catch (error) {
        apiPing = "Erro na requisição";
    }

    let Ping = client.ws.ping;

    msg = await message.reply({ content: 'Calculando o ping...' });

    let embed = new Discord.EmbedBuilder()
        .setDescription(`# <:wifi:966765489130975232> | Ping
ㅤ
**( <:antena:1274180077143330830> ) Latência do WebSocket:** ${Ping}ms
ㅤ
**( <:robo:1274181375301521438> ) Latência da API Web:** ${apiPing}ms
        `)
        .setThumbnail("https://cdn-icons-png.freepik.com/256/1084/1084253.png?semt=ais_hybrid")
        .setColor(client.cor)
    await msg.edit({ content: null, embeds: [embed] });
};

exports.help = {
    name: "ping",
    aliases: ["latencia"],
    description: "veja meu ping! Usage: {prefixo}ping",
    status: status
};
