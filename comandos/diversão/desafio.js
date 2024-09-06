const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const status = false;

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"});

    let embed = new Discord.EmbedBuilder().setColor(client.cor);
    let desafios = await db.get(`desafios`) || [];

    if (!args[0]) {
        client.setError(embed, "Por favor, especifique uma ação (listar, desafiar, enviar, rank).");
        client.setUsage(embed, `${client.prefix}desafio <listar|desafiar|enviar|rank>`);
        return message.reply({embeds: [embed]});
    }

    const action = args[0].toLowerCase();

    switch(action) {
        case "listar":
            if (desafios.length === 0) {
                embed.setTitle("Desafios Disponíveis")
                    .setDescription("Nenhum desafio disponível no momento.")
                    .setThumbnail(client.user.avatarURL())
            } else {
                let desc = desafios.map((desafio, index) => `${index + 1}. ${desafio.titulo}`).join("\n");
                embed.setTitle("Desafios Disponíveis")
                    .setDescription(desc)
                    .setThumbnail(client.user.avatarURL())
            }

            return message.reply({embeds: [embed]});

        case "desafiar":
            if (!args[1] || !args.slice(2).join(" ")) {
                client.setError(embed, "Por favor, forneça um título e uma descrição para o desafio.");
                client.setUsage(embed, `${client.prefix}desafio desafiar <título> <descrição>`);
                return message.reply({embeds: [embed]});
            }

            let titulo = args[1];
            let descricao = args.slice(2).join(" ");
            let novoDesafio = { titulo: titulo, descricao: descricao, criador: message.author.id };

            desafios.push(novoDesafio);
            await db.set(`desafios`, desafios);

            embed.setTitle("Novo Desafio Criado")
                .setDescription(`Desafio "${titulo}" criado por ${message.author.username}`);
            return message.reply({embeds: [embed]});

        case "enviar":
            let desafioIndex = parseInt(args[1]) - 1;

            if (isNaN(desafioIndex) || !desafios[desafioIndex]) {
                client.setError(embed, "Por favor, forneça o número de um desafio válido.");
                client.setUsage(embed, `${client.prefix}desafio enviar <número do desafio> <link da solução>`);
                return message.reply({embeds: [embed]});
            }

            let linkSolucao = args[2];
            if (!linkSolucao || !linkSolucao.startsWith("http")) {
                client.setError(embed, "Por favor, forneça um link válido para a solução.");
                client.setUsage(embed, `${client.prefix}desafio enviar <número do desafio> <link da solução>`);
                return message.reply({embeds: [embed]});
            }

            let solucao = { usuario: message.author.id, link: linkSolucao };

            desafios[desafioIndex].solucoes = desafios[desafioIndex].solucoes || [];
            desafios[desafioIndex].solucoes.push(solucao);
            await db.set(`desafios`, desafios);

            embed.setTitle("Solução Enviada")
                .setDescription(`Solução para o desafio "${desafios[desafioIndex].titulo}" enviada por ${message.author.username}`);

            await adicionarPontos(message.author.id, 10);  

        case "rank":
            let usuarios = await db.get(`ranking`) || {};

            if (Object.keys(usuarios).length === 0) {
                embed.setTitle("Ranking de Programadores")
                    .setDescription("Nenhuma pontuação registrada até o momento.");
            } else {
                let rank = Object.entries(usuarios).sort((a, b) => b[1] - a[1])
                    .map(([usuario, pontos], index) => `${index + 1}. <@${usuario}> - ${pontos} pontos`)
                    .join("\n");

                embed.setTitle("Ranking de Programadores")
                    .setDescription(rank);
            }

            return message.reply({embeds: [embed]});

        default:
            client.setError(embed, "Ação inválida. Use listar, desafiar, enviar, ou rank.");
            client.setUsage(embed, `${client.prefix}desafio <listar|desafiar|enviar|rank>`);
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
