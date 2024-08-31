const Discord = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const status = false; 

exports.run = async (client, message, args) => {
    if (message.author.id !== client.dev.id) {
        return message.reply({ content: "Você não tem permissão para usar este comando!" });
    }

    if (status) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    try {
        const code = args.join(' ');
        if (!code) {
            return message.reply({ content: "Você deve fornecer o código para avaliação!" });
        }

        let result;
        
        result = await eval(`(async () => { ${code.replaceAll("```js", "").replaceAll("```", "")} })()`); 

        if (typeof result !== 'string') {
            result = require('util').inspect(result, { depth: 0 });
        }

        // Limitar o tamanho do resultado para evitar mensagens muito longas
        const resultLimit = 2000;
        if (result.length > resultLimit) {
            result = result.slice(0, resultLimit) + '... [Resultado truncado]';
        }

        message.reply({ content: `\`\`\`js\n${result}\n\`\`\`` });
    } catch (error) {
        // Limitar o tamanho da mensagem de erro
        const errorLimit = 2000;
        let errorMessage = error.message;
        if (errorMessage.length > errorLimit) {
            errorMessage = errorMessage.slice(0, errorLimit) + '... [Erro truncado]';
        }

        message.reply({ content: `\`\`\`js\n${errorMessage}\n\`\`\`` });
    }
};

exports.help = {
    name: "eval",
    aliases: [],
};
