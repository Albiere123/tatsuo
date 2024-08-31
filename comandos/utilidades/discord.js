const Discord = require("discord.js")
const axios = require('axios')
const {QuickDB} = require('quick.db')
const db = new QuickDB()
exports.run = async (client,  message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if(message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"})
    let erro = new Discord.EmbedBuilder()
    if(!args[0]) {
        client.setError(erro, `Insira o nome de uma função ou evento existente no DBD`)
        client.setUsage(erro, `${client.prefix}dbd <função ou evento>`)
        return message.reply({embeds: [erro]})
    }
    if (args[0].includes("\n") || args[0].includes("\r")) {
        client.setError(erro, `Evite usar quebra de linha.`)
        client.setUsage(erro, `${client.prefix}dbd <função ou evento>`)
        return message.reply({embeds: [erro]}) 
    }
    let a = args[0].toLowerCase().replace("$", "");    
    try {
    let resposta = await axios.get(`https://dbfd-api-tatsuo.glitch.me/fakezin/${a.toLowerCase()}.json`)
    
    let example = resposta.data.pt.example.replaceAll("<quebra de linha>", `\n`)
    let embed = new Discord.EmbedBuilder()
    .setDescription("# <:global:1275650280850984961> DBD")
    .addFields([
        { name: "ㅤ\n<:lista:1275656990013526076> Nome da Função", value: `\`${resposta.data.pt.name}\``},
        { name: "<:descricaodotrabalho:1275839638631612487> Descrição", value: resposta.data.pt.description},
        { name: "<:megafone:1275650267592790016> Expressão para uso", value: `\`\`\`${resposta.data.pt.use}\`\`\``},
        { name: "<:pesquisa:1275839827199398013> Exemplo", value: `\`\`\`${example}\`\`\``}
    ])
    .setColor(client.cor)
    .setImage(resposta.data.pt.image)
    .setThumbnail("https://nightnutsky.gallerycdn.vsassets.io/extensions/nightnutsky/bdfd-bds/2.1.0/1688167246254/Microsoft.VisualStudio.Services.Icons.Default")
    message.reply({embeds: [embed]})
} catch(e) {
    let b = ``;
    console.log(e)
    if(a.startsWith("on")) b = "e Evento"
    else b = "a Função"
    client.setError(erro, `Não encontrei est${b} na API, verifique se est${b} existe. Minha API contém 35,75% das funções e eventos!`)
    client.setUsage(erro, `${client.prefix}dbd <evento ou função>`)
    return message.reply({embeds: [erro]})
}
}

exports.help = {
    name: "dbd",
    aliases: [],
    status: false,
    description: "Use este comando para ver informações sobre funções do dbd. Usage: {prefixo}dbd <função ou evento>"
}