const Discord = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    if (!args.length) {
        let embed = new Discord.EmbedBuilder();
        client.setError(embed, "Você precisa fornecer o texto a ser revisado.");
        client.setUsage(embed, `${client.prefix}revisar <texto>`);
        return message.reply({ embeds: [embed] });
    }

    const text = args.join(" ");

    try {
        let correctedText = text;
        let correctionsList = [];
        let currentText = text;

        const correctText = async (text) => {
            const response = await fetch('https://api.languagetool.org/v2/check', {
                method: 'POST',
                body: new URLSearchParams({
                    text,
                    language: 'pt-BR'
                }).toString(),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return await response.json();
        };

        let hasErrors = true;

        while (hasErrors) {
            const data = await correctText(currentText);

            if (data.matches.length > 0) {
                const sortedMatches = data.matches.sort((a, b) => b.offset - a.offset);

                for (const match of sortedMatches) {
                    const { offset, length, message, replacements } = match;
                    const originalText = currentText.substring(offset, offset + length);
                    const replacementText = replacements.length > 0 ? replacements[0].value : "Correção não encontrada";

                    correctionsList.push(`${message}: "${originalText}" → "${replacementText}"`);

                    correctedText = correctedText.slice(0, offset) + replacementText + correctedText.slice(offset + length);
                    currentText = correctedText;
                }
            } else {
                hasErrors = false; 
            }
        }

        if (correctionsList.length === 0) {
            return message.reply("Não encontrei nenhum erro no seu texto.");
        }

        const embed = new Discord.EmbedBuilder()
            .setDescription('# Correção Ortográfica e Gramatical')
            .setColor(client.cor)
            .addFields([
                { name: '<:avaliacao:1275831072554356918> Original:', value: text, inline: false },
                { name: '<:guia:1275650254384926781> Corrigido:', value: correctedText, inline: false },
                { name: '<:pesquisa:1275839827199398013> Correções:', value: correctionsList.join('\n'), inline: false }
            ])
            .setThumbnail("https://cdn-icons-png.flaticon.com/128/3378/3378111.png");

        return message.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Erro ao revisar o texto:', error);
        let embed = new Discord.EmbedBuilder();
        client.setError(embed, "Ocorreu um erro ao revisar o texto.");
        return message.reply({ embeds: [embed] });
    }
};

exports.help = {
    name: "revisar",
    aliases: ["grammar"],
    description: "Verifica e corrige erros ortográficos e gramaticais em uma mensagem. Usage: revisar <texto>",
    status: true
};
