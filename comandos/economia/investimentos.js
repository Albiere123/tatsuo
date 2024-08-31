const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const api = require("yuuta-functions");
const tiposValidos = ["ações", "imóveis", "startups"];

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && !status) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    let userData = await db.get(message.author.id) || {money: 0, sb: "Não Definido", trabalho: null, investimentos: null};
    const embed = new Discord.EmbedBuilder().setColor(client.cor);

    if (!args[0] || (args[0].toLowerCase() !== "lista" && isNaN(args[0]))) {
        client.setError(embed, "Você deve fornecer um valor válido para investir.");
        client.setUsage(embed, `${client.prefix}investir <valor | lista> <tipo>`)
        return message.reply({embeds: [embed]})
    }

    if (args[0].toLowerCase() === "lista") {
        
        let mentionedUser = message.mentions.users.first() || client.users.cache.get(args[1]);

        if (!mentionedUser && args.length > 1) {
            const usernameOrDisplayName = args.slice(1).join(' ');
            message.reply(usernameOrDisplayName)
            mentionedUser = client.users.cache.find(u => u.username.toLowerCase() === usernameOrDisplayName.toLowerCase() || `${u.username.toLowerCase()}#${u.discriminator}` === usernameOrDisplayName.toLowerCase());
        }
    
        if (!mentionedUser) mentionedUser = message.author;

        userData = await db.get(mentionedUser.id) || {money: 0, sb: "Não Definido", trabalho: null, investimentos: null};

        return showInvestments(message, embed, userData, mentionedUser);
    }

    const valor = parseInt(args[0]);
    if (isNaN(valor) || valor <= 0) {
        client.setError(embed, "Você deve fornecer um valor maior que zero para investir.");
        client.setUsage(embed, `${client.prefix}investir <valor | lista> <tipo>`)
        return message.reply({embeds: [embed]})
    }

    const tipo = args[1] ? args[1].toLowerCase() : null;
    if (!tipo || !tiposValidos.includes(tipo)) {
        client.setError(embed, "Você deve fornecer um tipo de investimento válido.");
        client.setUsage(embed, `${client.prefix}investir <valor | lista> <tipo>`)
        return message.reply({embeds: [embed]})
    }

    if (userData.money < valor) {
        client.setError(embed, "Você não tem dinheiro suficiente para fazer esse investimento.");
        client.setUsage(embed, `${client.prefix}investir <valor | lista> <tipo>`)
        return message.reply({embeds: [embed]})
    }

    const retorno = calcularRetorno(valor, tipo);
    const novoInvestimento = { valor, retorno, tipo };

    userData.investimentos = [...(userData.investimentos || []), novoInvestimento];
    userData.money = userData.money - valor + retorno;

    await db.set(message.author.id, userData);

    embed.setTitle("Investimento Bem Sucedido")
        .setDescription(`Você investiu **${valor}** em **${tipo}** e recebeu um retorno de **${retorno}**!`);
    
    if (userData.investimentos.length > 0) {
        embed.addFields({ 
            name: 'Seus Investimentos', 
            value: formatInvestments(userData.investimentos) 
        });
    }
    message.reply({ embeds: [embed] });
};

function calcularRetorno(valor, tipo) {
    const taxas = {
        'ações': 0.15,
        'imóveis': 0.10,
        'startups': 0.20
    };
    return Number((valor * taxas[tipo]).toFixed(2));
}

function formatInvestments(investimentos) {
    return investimentos.map((inv, index) => 
        `**${index + 1}.** Tipo: ${inv.tipo} | Investido: ${inv.valor} | Retorno: ${inv.retorno}`
    ).join('\n');
}


function showInvestments(message, embed, userData, user) {
    embed.setTitle(`Investimentos - ${user.username}`)
        .setDescription(userData.investimentos && userData.investimentos.length > 0
            ? formatInvestments(userData?.investimentos)
            : "Sem investimentos!")
        .setThumbnail(user.avatarURL())
        
    return message.reply({ embeds: [embed] });
}

exports.help = {
    name: "investir",
    aliases: ["invest"],
    description: "Invista seu dinheiro em ações, imóveis ou startups. Usage: {prefixo}investir <valor> <ações|imóveis|startups>",
    status: false,
    atualizarInvestimentos: async () => atualizarInvestimentos()
};


async function atualizarInvestimentos() {
   
    const allKeys = await db.all();
    
    for (let key of allKeys) {
       
        const userData = await db.get(key.id);

        
        if (userData && userData.investimentos) {
            
            userData.investimentos = userData.investimentos.map(investimento => {
                
                const flutuacao = calcularFlutuacao(investimento.tipo);

                
                const retornoAtualizado = investimento.retorno !== null && investimento.retorno !== undefined
                    ? Number((investimento.valor * (flutuacao)).toFixed(2))
                    : 0;

                
                investimento.retorno = retornoAtualizado;
                userData.money = userData.money + Number(retornoAtualizado)
                return investimento;
            });
            
            await db.set(key.id, userData);
        }
    }
}

function calcularFlutuacao(tipo) {
    const flutuacoes = {
        'ações': Math.random() * 0.2 - 0.1, 
        'imóveis': Math.random() * 0.1 - 0.05, 
        'startups': Math.random() * 0.4 - 0.2 
    };
    return flutuacoes[tipo] || 0;
}
