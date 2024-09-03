const translateText = async (text, targetLanguage = 'pt') => {
    const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
    const MAX_CHUNK_SIZE = 500; // Tamanho máximo do texto por requisição
    let translatedText = '';

    try {
        // Divide o texto em partes menores se for muito longo
        for (let i = 0; i < text.length; i += MAX_CHUNK_SIZE) {
            const chunk = text.slice(i, i + MAX_CHUNK_SIZE);
            const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${targetLanguage}`);
            const data = await response.json();
            
            if (data.responseStatus === 200) {
                translatedText += data.responseData.translatedText;
            } else {
                return text; // Retorna o texto original se houver um erro na tradução
            }
        }
        return translatedText;
    } catch (error) {
        return text; // Retorna o texto original se houver um erro na tradução
    }
};


module.exports = {
    translateText
}