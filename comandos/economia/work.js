const Discord = require("discord.js")
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const api = require("../../api.json")

async function getWork(user, message, client) {
    user = await db.get(`${user.id}`)
    const trabalho = await user?.trabalho || false;
    if(trabalho == "Streamer") return {
        description: api.work.desc.streamer[Math.floor(Math.random() * api.work.desc.streamer.length)],
        imagem: "https://cdn-icons-png.flaticon.com/512/9299/9299767.png"
    }
    else if(trabalho == "CLT") return {
        description: api.work.desc.clt[Math.floor(Math.random() * api.work.desc.clt.length)],
        imagem: "https://cdn-icons-png.flaticon.com/512/1839/1839325.png"
    }
    else if(trabalho == "Engenheiro de Software") return {
        description: api.work.desc.es[Math.floor(Math.random() * api.work.desc.es.length)],
        imagem: "https://cdn-icons-png.flaticon.com/128/6010/6010054.png"
    }
    else return trabalho;
}

exports.run = async(client, message, args) => {
    const status = (await db.get(`work_privado`)) ? (await db.get(`work_privado`)) : false;
    if(message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"})
        const userId = message.author.id;
    const minReward = 750;
    const maxReward = 1000;
    const reward = Math.floor(Math.random() * (maxReward - minReward + 1)) + minReward;
    const now = new Date();

    
    const lastClaim = await db.get(`work_${userId}`);
    if (lastClaim) {
        const lastClaimDate = new Date(lastClaim);
        const timeDiff = now - lastClaimDate;
        const hoursPassed = timeDiff / (1000 * 60 * 60);

        if (hoursPassed < 4 && message.author.id != client.dev.id) {
            const remainingTime = Math.ceil(4 - hoursPassed);
            let embed = new Discord.EmbedBuilder()
            client.setError(embed, `Você já reivindicou sua recompensa. Tente novamente em ${remainingTime} horas.`)
            return message.reply({embeds: [embed]})
        }
    }

    let user = await getWork(message.author, message, client)
    let erro = new Discord.EmbedBuilder()
    if(!user) {
        client.setError(erro, `Parace que você não possue um emprego...`)
        return message.reply({embeds: [erro]})}
    let embed = new Discord.EmbedBuilder()
    .setDescription(`# <:carteiradeidentidade2:1275650276954603631> Trabalho
ㅤ
<:midiasocial:1275650307858108561> Detalhe do serviço: \`${user.description}\`
ㅤ
<:dinheiro:1275650298005950494> Quantia ganha: \`R$ ${reward}\`
`)
    .setThumbnail(user.imagem)
    .setColor(client.cor)
    message.reply({embeds: [embed]})
    let userD = await db.get(message.author.id)
    userD.money = (userD.money ? userD.money : 0) + reward 
    await db.set(message.author.id, {
        money: userD.money,
        sb: userD.sb,
        trabalho: userD.trabalho,
        investimentos: userD.investimentos ? userD.investimentos : null})
    await db.set(`work_${userId}`, now.toISOString())
}

exports.help = {
    name: "work",
    aliases: ["trabalho", "trabalhar"],
    description: "Trabalhe e ganhe dinheiro! Usage: {prefixo}work",
    status: false
}