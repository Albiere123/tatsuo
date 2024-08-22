const Discord = require('discord.js');
const api = require("../../api.json")
const words = api.forca;
function removeAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
const {QuickDB} = require('quick.db')
const db = new QuickDB()

const maxAttempts = 6;
const gameTime = 240000; 

let activeGames = {};

exports.run = async(client, message, args) => {
  const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;

  if(message.author.id !== client.dev.id && status == false) return message.reply({content: "Este comando está em manutenção!"})
  const channelId = message.channel.id;
  let erro = new Discord.EmbedBuilder()
  if (activeGames[channelId]) {
    client.setError(erro, "Parece que alguem ja está jogando neste chat... Espere a partida acabar!")
    client.setUsage(erro, `${client.prefix}forca`)
    return message.reply({embeds: [erro]})
  }

  activeGames[channelId] = true;

  let h = words[Math.floor(Math.random() * words.length)];
  let dica = h.dica;
  let word = h.palavra;
  let normalizedWord = removeAccents(word);
  let hiddenWord = word.replace(/./g, '\\_ ');
  let attempts = 0;
  let guessedLetters = [];
  let currentPlayer = null;

  const renderGame = () => {
    return word.split('').map(letter => guessedLetters.includes(removeAccents(letter)) ? letter : '\\_').join(' ');
  };

  const updateEmbed = () => {
    embed.setDescription(renderGame())
      .spliceFields(0, 1, { name: 'Tentativas restantes', value: (maxAttempts - attempts).toString() });
    gameMessage.edit({ embeds: [embed] });
  };

  const embed = new Discord.EmbedBuilder()
    .setTitle('**<:jogoForca:1274043422071722159> | Jogo da Forca**')
    .setDescription(renderGame())
    .addFields([
        {
        name: 'Tentativas restantes', value: (maxAttempts - attempts).toString()
        }, {
            name: "Dicas Restantes", value: dica
        }])
    .setColor(client.cor)
    .setThumbnail("https://cdn-icons-png.flaticon.com/512/6168/6168659.png")
    .setFooter({text: 'Adivinhe uma letra digitando no chat.', iconURL: client.user.avatarURL()});

  let gameMessage = await message.channel.send({ embeds: [embed] });

  const filter = response => /^[a-zA-Z\-]$/.test(response.content);
  const collector = message.channel.createMessageCollector({ filter, time: gameTime });

  collector.on('collect', m => {
    if (currentPlayer && m.author.id !== currentPlayer.id) {
      return message.channel.send(`Aguarde sua vez, ${m.author.username}!`);
    }

    currentPlayer = m.author;

    const letter = removeAccents(m.content.toLowerCase());
    if (guessedLetters.includes(letter)) {
      message.channel.send(`Alguém já adivinhou essa letra, ${m.author.username}! Tente outra.`);
    } else {
      guessedLetters.push(letter);
      if (normalizedWord.includes(letter)) {
        hiddenWord = word.split('').map(l => removeAccents(l).includes(letter) ? l : '\\_').join(' ');
      } else {
        attempts++;
      }

      updateEmbed();

      if (!renderGame().includes('\\_')) {
        message.channel.send(`Parabéns, ${m.author.username}, você ganhou! A palavra era **${word}**.`);
        collector.stop();
      } else if (attempts >= maxAttempts) {
        message.channel.send(`Você perdeu! A palavra era **${word}**.`);
        collector.stop();
      }
    }

    setTimeout(() => { currentPlayer = null; }, 1000); 
  });

  collector.on('end', () => {
    if (renderGame().includes('\\_') && attempts < maxAttempts) {
      message.channel.send(`Tempo esgotado! A palavra era **${word}**.`);
    }

    delete activeGames[channelId];
  });
}

exports.help = {
  name: 'forca',
  aliases: ['hangman'],
  description: "Jogue o famoso jogo da forca! Usage: {prefixo}forca",
  status: false
};