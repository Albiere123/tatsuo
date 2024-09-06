const translate = require('@vitalets/google-translate-api');

async function translateText(text, targetLang) {
    try {
        if (!text || !targetLang) {
            throw new Error('Por favor, forneça o texto e o idioma alvo para a tradução.');
        }

        const result = await translate.translate(text, { to: targetLang });
        return result.text;
    } catch (error) {
        const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
    const MAX_CHUNK_SIZE = 500; // Tamanho máximo do texto por requisição
    let translatedText = '';

    try {
        for (let i = 0; i < text.length; i += MAX_CHUNK_SIZE) {
            const chunk = text.slice(i, i + MAX_CHUNK_SIZE);
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${targetLang}`);
            const data = await response.json();
            
            if (data.responseStatus === 200) {
                translatedText += data.responseData.translatedText;
            } else {
                return text; 
            }
        }
        return translatedText;
    } catch (error) {
        return text; // Retorna o texto original se houver um erro na tradução
    }
    }
}


async function translateEmbed(embed, targetLang) {
    try {
        if (!embed || !targetLang) {
            throw new Error('Por favor, forneça o embed e o idioma alvo para a tradução.');
        }

        // Converte embed para o formato de dados
        const embedData = embed.data;

        const translatedEmbed = {
            ...embedData,
            title: embedData.title ? await translateText(embedData.title, targetLang) : undefined,
            description: embedData.description ? await translateText(embedData.description, targetLang) : undefined,
            fields: embedData.fields ? await Promise.all(embedData.fields.map(async field => ({
                name: field.name ? await translateText(field.name, targetLang) : undefined,
                value: field.value ? await translateText(field.value, targetLang) : undefined,
                inline: field.inline,
            }))) : undefined,
            footer: embedData.footer ? {
                text: embedData.footer.text ? await translateText(embedData.footer.text, targetLang) : undefined,
                iconURL: embedData.footer.iconURL,
            } : undefined,
            author: embedData.author ? {
                name: embedData.author.name ? await translateText(embedData.author.name, targetLang) : undefined,
                url: embedData.author.url,
                iconURL: embedData.author.iconURL,
            } : undefined,
        };

        return translatedEmbed;
    } catch (error) {
        throw new Error(`Erro ao traduzir o embed: ${error.message}`);
    }
}



const getAPI = async(text, tipo, Aleatório) => {
    try {if(typeof text == String) return console.log("Apenas strings")
    const types = ["memes", "hug", "slap", "kiss", "puzzles", "forca", "perguntas"]
    if(!types.includes(text)) return console.log("Opção invalida!")
    if(tipo) return require("./api.json")[text][tipo]
    else if(Aleatório) return require("./api.json")[text][Math.floor(Math.random()*require("./api.json")[text].length)]
    else require("./api.json")[text]
}
catch(e) {
    console.log(e)
}
}
module.exports = {
    translateText, getAPI, translateEmbed
}