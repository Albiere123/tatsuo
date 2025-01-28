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
  const functions = require("../../functions.js")
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && status === false) {
<<<<<<< HEAD
<<<<<<< HEAD
        return message.reply({ content: await functions.tradutor(await functions.getServerLanguage(message.guild.id), "manutenção")});
=======
        return message.reply({ content: functions.tradutor(functions.getServerLanguage(message.guild.id), "manutenção")});
>>>>>>> 32e921881c151f4161707c42cdc6fb88c4a5e5ce
=======
        return message.reply({ content: functions.tradutor(functions.getServerLanguage(message.guild.id), "manutenção")});
>>>>>>> 32e921881c151f4161707c42cdc6fb88c4a5e5ce
    }
  const channelId = message.channel.id;
  let erro = new Discord.EmbedBuilder()
  if (activeGames[channelId]) {
    await client.setError(message, erro, await functions.tradutor(await functions.getServerLanguage(message.guild.id), "forca.jogoExistente"))
    await client.setUsage(message, erro, `${client.prefix}forca`)
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

  const updateEmbed = async () => {
    embed.setDescription(renderGame())
      .spliceFields(0, 1, { name: await functions.tradutor(await functions.getServerLanguage(message.guild.id), "forca.tentativasRestantes"), value: (maxAttempts - attempts).toString() });
    gameMessage.edit({ embeds: [embed] });
  };

  const embed = new Discord.EmbedBuilder()
    .setTitle(await functions.tradutor(await functions.getServerLanguage(message.guild.id), "forca.jogoForca"))
    .setDescription(renderGame())
    .addFields([
        {
        name: await functions.tradutor(await functions.getServerLanguage(message.guild.id), "forca.tentativasRestantes"), value: (maxAttempts - attempts).toString()
        }, {
            name: await functions.tradutor(await functions.getServerLanguage(message.guild.id), "forca.dicasRestantes"), value: dica
        }])
    .setColor(client.cor)
    .setThumbnail("https://cdn-icons-png.flaticon.com/512/6168/6168659.png")
    .setFooter({text: await functions.tradutor(await functions.getServerLanguage(message.guild.id), "forca.footer"), iconURL: client.user.avatarURL()});

  let gameMessage = await message.channel.send({ embeds: [embed] });

  const filter = response => /^[a-zA-Z\-]$/.test(response.content);
  const collector = message.channel.createMessageCollector({ filter, time: gameTime });

  collector.on('collect', async m => {
    if (currentPlayer && m.author.id !== currentPlayer.id) {
      return message.channel.send(await functions.tradutor(await functions.getServerLanguage(message.guild.id), "forca.aguardeSuaVez", { user: m.author.username }));
    }

    currentPlayer = m.author;

    const letter = removeAccents(m.content.toLowerCase());
    if (guessedLetters.includes(letter)) {
      message.channel.send(await functions.tradutor(await functions.getServerLanguage(message.guild.id), "forca.letraJaAdvinhada", { user: m.author.username }));
    } else {
      guessedLetters.push(letter);
      if (normalizedWord.includes(letter)) {
        hiddenWord = word.split('').map(l => removeAccents(l).includes(letter) ? l : '\\_').join(' ');
      } else {
        attempts++;
      }

      updateEmbed();

      if (!renderGame().includes('\\_')) {
        message.channel.send(await functions.tradutor(await functions.getServerLanguage(message.guild.id), "forca.vitoria", { user: m.author.username, word }));
        collector.stop();
      } else if (attempts >= maxAttempts) {
        message.channel.send(await functions.tradutor(await functions.getServerLanguage(message.guild.id), "forca.derrota", { word }));
        collector.stop();
      }
    }

    setTimeout(() => { currentPlayer = null; }, 1000); 
  });

  collector.on('end', async () => {
    if (renderGame().includes('\\_') && attempts < maxAttempts) {
     (await client.channels.cache.get(channelId))?.send(await functions.tradutor(await functions.getServerLanguage(message.guild.id), "forca.tempoEsgotado", { word }));
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
