const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const status = false;
const functions = require("../../functions.js")
exports.run = async (client, message, args) => {
    
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: await functions.tradutor(await functions.getServerLanguage(message.guild.id), "manutenção")});
    }
    let embed = new Discord.EmbedBuilder().setColor(client.cor);
    let desafios = await db.get(`desafios`) || [];
    let lang = await functions.getServerLanguage(message.guild.id)
    if (!args[0]) {
        await client.setError(message, embed, await functions.tradutor(lang, "desafio.no_args"));
        await client.setUsage(message, embed, await functions.tradutor(lang, "desafio.usage", {prefixo: client.prefix}));
        return message.reply({embeds: [embed]});
    }

    const action = args[0].toLowerCase();

    switch(action) {
        case "listar" || "list":
            if (desafios.length === 0) {
                embed.setTitle(await functions.tradutor(lang, "desafio.title"))
                    .setDescription(await functions.tradutor(lang, "desafio.vazio"))
                    .setThumbnail(client.user.avatarURL())
            } else {
                let desc = desafios.map((desafio, index) => `${index + 1}. ${desafio.titulo}`).join("\n");
                embed.setTitle(await functions.tradutor(lang, "desafio.title"))
                    .setDescription(desc)
                    .setThumbnail(client.user.avatarURL())
            }

            return message.reply({embeds: [embed]});

        case "desafiar" || "challenge":
            if (!args[1] || !args.slice(2).join(" ")) {
                await client.setError(message, embed, await functions.tradutor(lang, "desafio.no_args[1]"));
                await client.setUsage(message, embed, await functions.tradutor(lang, "desafio.usage[1]", {prefixo: client.prefix}));
                return message.reply({embeds: [embed]});
            }

            let titulo = args[1];
            let descricao = args.slice(2).join(" ");
            let novoDesafio = { titulo: titulo, descricao: descricao, criador: message.author.id };

            desafios.push(novoDesafio);
            await db.set(`desafios`, desafios);

            embed.setTitle(await functions.tradutor(lang, "desafio.criado"))
                .setDescription(await functions.tradutor(lang, "desafio.criado_desc", {title: titulo, user: message.author.username}));
            return message.reply({embeds: [embed]});

        case "enviar" || "send":
            let desafioIndex = parseInt(args[1]) - 1;

            if (isNaN(desafioIndex) || !desafios[desafioIndex]) {
                await client.setError(message, embed, await functions.tradutor(lang, "desafio.no_args[2]"));
                await client.setUsage(message, embed, await functions.tradutor(lang, "desafio.usage[2]", {prefixo: client.prefix}));
                return message.reply({embeds: [embed]});
            }

            let linkSolucao = args[2];
            if (!linkSolucao || !linkSolucao.startsWith("http")) {
                await client.setError(message, embed, await functions.tradutor(lang, "desafio.link_invalido"));
                await client.setUsage(message, embed, await functions.tradutor(lang, "desafio.usage[2]", {prefixo: client.prefix}));
                return message.reply({embeds: [embed]});
            }

            let solucao = { usuario: message.author.id, link: linkSolucao };

            desafios[desafioIndex].solucoes = desafios[desafioIndex].solucoes || [];
            desafios[desafioIndex].solucoes.push(solucao);
            await db.set(`desafios`, desafios);

            embed.setTitle("Solução Enviada")
                .setDescription(await functions.tradutor(lang, "desafio.s_desc", {desafio: desafios[desafioIndex].titulo, user: message.author.username}));

            await adicionarPontos(message.author.id, 10);  

        case "rank":
            let usuarios = await db.get(`ranking`) || {};

            if (Object.keys(usuarios).length === 0) {
                embed.setTitle(await functions.tradutor(lang, "desafio.ranking_t"))
                    .setDescription(await functions.tradutor(lang, "desafio.ranking_d"));
            } else {
                let rank = Object.entries(usuarios).sort((a, b) => b[1] - a[1])
                    .map(([usuario, pontos], index) => `${index + 1}. <@${usuario}> - ${pontos} pontos`)
                    .join("\n");

                embed.setTitle(await functions.tradutor(lang, "desafio.ranking_t"))
                    .setDescription(rank);
            }

            return message.reply({embeds: [embed]});

        default:
            await client.setError(message, embed, await functions.tradutor(lang, "desafio.no_args"));
            await client.setUsage(message, embed, await functions.tradutor(lang, "desafio.usage", {prefixo: client.prefix}));
            return message.reply({embeds: [embed]});
    }

    async function adicionarPontos(usuario, pontos) {
        let ranking = await db.get(`ranking`) || {};
        ranking[usuario] = (ranking[usuario] || 0) + pontos;
        await db.set(`ranking`, ranking);
    }
}

exports.help = {
    name: "desafio",
    aliases: ["challenge"],
    description: "Proponha e resolva desafios de programação. Usage: {prefixo}desafio <listar|desafiar|enviar|rank>",
    status: status
};
