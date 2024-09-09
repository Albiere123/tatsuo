const Discord = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();


function tokenize(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
}


function summarizeText(text, sentenceCount = 3) {

    const sentences = text.split(/[.!?]\s+/).filter(sentence => sentence.length > 20);
    
    if (sentences.length === 0) return text; 
    
    const wordFrequency = {};
    
   
    tokenize(text).forEach(word => {
        if (!wordFrequency[word]) wordFrequency[word] = 0;
        wordFrequency[word]++;
    });

  
    const rankedSentences = sentences
        .map(sentence => {
            const sentenceWords = tokenize(sentence);
            const score = sentenceWords.reduce((total, word) => total + (wordFrequency[word] || 0), 0);
            return { sentence, score };
        })
        .sort((a, b) => b.score - a.score);

    
    return rankedSentences.slice(0, sentenceCount).map(s => s.sentence).join('. ') + '.';
}

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status === false) return message.reply({ content: "Este comando está em manutenção!" });

    if (!args.length) {
        let embed = new Discord.EmbedBuilder();
        client.setError(embed, "Você precisa fornecer o texto a ser resumido.");
        client.setUsage(embed, `${client.prefix}resumir <texto>`);
        return message.reply({ embeds: [embed] });
    }

    const text = args.join(" ");
    if(text.length >= 1024) return message.reply("Insira um texto com no máximo 1024 caracteres!")
    try {
        const summary = summarizeText(text);

        const embed = new Discord.EmbedBuilder()
            .setDescription('<:professor:1281794203831107664> Resumo do Texto')
            .setColor(client.cor)
            .addFields([
                { name: '<:lista:1275656990013526076> Original:', value: text, inline: false },
                { name: '<:descricaodotrabalho:1275839638631612487> Resumo:', value: summary, inline: false }
            ])
            .setTimestamp();

        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Erro ao resumir o texto:', error);
        let embed = new Discord.EmbedBuilder();
        client.setError(embed, "Ocorreu um erro ao resumir o texto.");
        return message.reply({ embeds: [embed] });
    }
};

exports.help = {
    name: "resumir",
    aliases: ["summary"],
    description: "Resume textos longos em uma versão curta e compreensível com base na frequência das palavras. Usage: resumir <texto>",
    status: true
};
