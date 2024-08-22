const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const api = require("yuuta-functions")
exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status == false) return message.reply({ content: "Este comando está em manutenção!" });
    const userData = await db.get(`${message.author.id}`);
    let embed = new Discord.EmbedBuilder();

    
    if (!args[0] || args[0].toLowerCase() != "lista" && isNaN(args[0])) {
        client.setError(embed, "Você deve fornecer um valor válido para investir.");
        client.setUsage(embed, `${client.prefix}investir <valor> <tipo>`);
        return message.reply({ embeds: [embed] });
    }
    if(args[0] == "lista") {
        embed.setDescription(`# Seus investimentos
${await userData.investimentos ? await userData.investimentos.map((investi ,index) => {
    return `Investimento ${index+1}\nValor do investimento: ${investi.valor}\nTipo do investimento: ${investi.tipo}\nRetorno: ${api.ab(investi.retorno, 2)}`
}).join("\n\n") : "Sem investimentos!"}`)
        embed.setColor(client.cor)
        return message.reply({embeds: [embed]})
    }
    
    const tiposValidos = ["ações", "imóveis", "startups"];
    if (!args[1] || !tiposValidos.includes(args[1].toLowerCase())) {
        client.setError(embed, "Você deve fornecer um tipo de investimento válido.");
        client.setUsage(embed, `${client.prefix}investir <valor> <ações|imóveis|startups>`);
        return message.reply({ embeds: [embed] });
    }

    const valor = parseInt(args[0]);
    const tipo = args[1].toLowerCase();
    
    
    
    if (userData.money < valor) {
        client.setError(embed, "Você não tem dinheiro suficiente para fazer esse investimento.");
        client.setUsage(embed, `${client.prefix}investir <valor> <ações|imóveis|startups>`);
        return message.reply({ embeds: [embed] });
    }

    
    let retorno;
    switch (tipo) {
        case 'ações':
            retorno = valor * 0.15; 
            break;
        case 'imóveis':
            retorno = valor * 0.10; 
            break;
        case 'startups':
            retorno = valor * 0.20; 
            break;
    }

    
    const novoInvestimento = { valor, retorno, tipo };
    const investimentos = [...(userData.investimentos || []), novoInvestimento];

    await db.set(`${message.author.id}`, {
        money: userData.money - valor + retorno,
        sb: userData.sb,
        trabalho: userData.trabalho,
        investimentos: investimentos
    });

   
    embed.setColor(client.cor)
        .setTitle(`Investimento Bem Sucedido`)
        .setDescription(`Você investiu **${valor}** em **${tipo}** e recebeu um retorno de **${retorno}**!`);

    
    if (investimentos.length > 0) {
        embed.addFields({ 
            name: 'Seus Investimentos', 
            value: investimentos.map((inv, index) => `**${index + 1}.** Tipo: ${inv.tipo} | Investido: ${inv.valor} | Retorno: ${inv.retorno}`).join('\n') 
        });
    }

    message.reply({ embeds: [embed] });
};

exports.help = {
    name: "investir",
    aliases: ["invest"],
    description: "Invista seu dinheiro em ações, imóveis ou startups. Usage: {prefixo}investir <valor> <ações|imóveis|startups>",
    status: false
};
