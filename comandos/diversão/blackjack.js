const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const api = require("yuuta-functions");
const functions1 = require("../../functions.js")
exports.run = async (client, message, args) => {
  const error = new Discord.EmbedBuilder();
  const lang = await functions1.getServerLanguage(message.guild.id);

  // Verificar status do comando
  const status = (await db.get(`${this.help.name}_privado`)) || false;
  if (message.author.id !== client.dev.id && status === false) {
    await client.setError(
      message,
      error,
      await functions1.tradutor(lang, "manutenção")
    );
    return message.reply({ embeds: [error] });
  }

  // Recuperar saldo do usuário
  const user = await db.get(message.author.id);
  const money = user?.money || 0;
  const aposta = parseInt(args[0]);

  // Validar a aposta
  if (!aposta || isNaN(aposta) || aposta <= 0) {
    await client.setError(
      message,
      error,
      await functions1.tradutor(lang, "blackjack.aposta_invalida")
    );
    await client.setUsage(
      message,
      error,
      await functions1.tradutor(lang, "blackjack.uso", { prefixo: client.prefix })
    );
    return message.reply({ embeds: [error] });
  }

  if (aposta > money) {
    await client.setError(
      message,
      error,
      await functions1.tradutor(lang, "blackjack.saldo_insuficiente", {
        saldo: api.ab(money),
      })
    );
    return message.reply({ embeds: [error] });
  }

  // Função para criar o baralho
  function criarBaralho() {
    const naipes = ["♦️", "♣️", "♥️", "♠️"];
    const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const baralho = [];
    naipes.forEach((naipe) => {
      valores.forEach((valor) => {
        baralho.push({ valor, naipe });
      });
    });
    return baralho.sort(() => Math.random() - 0.5);
  }

  // Função para calcular o valor da mão
  function calcularValor(mao) {
    let total = 0;
    let ases = 0;

    mao.forEach((carta) => {
      if (["J", "Q", "K"].includes(carta.valor)) {
        total += 10;
      } else if (carta.valor === "A") {
        total += 11;
        ases += 1;
      } else {
        total += parseInt(carta.valor);
      }
    });

    while (total > 21 && ases > 0) {
      total -= 10;
      ases -= 1;
    }
    return total;
  }

  // Início do jogo
  const baralho = criarBaralho();
  const maoJogador = [baralho.pop(), baralho.pop()];
  const maoBot = [baralho.pop(), baralho.pop()];

  let valorJogador = calcularValor(maoJogador);
  let valorBot = calcularValor(maoBot);

  const embed = new Discord.EmbedBuilder()
    .setTitle(await functions1.tradutor(lang, "blackjack.titulo"))
    .setColor(client.cor)
    .setDescription(
      `💵 **${await functions1.tradutor(lang, "blackjack.aposta")}:** ${api.ab(aposta)}\n\n🃏 **${await functions1.tradutor(lang, "blackjack.mao_jogador")}:** ${maoJogador
        .map((c) => `${c.valor}${c.naipe}`)
        .join(", ")} (Total: ${valorJogador})\n🤖 **${await functions1.tradutor(lang, "blackjack.mao_dealer")}:** ${maoBot[0].valor}${maoBot[0].naipe}`
    )
    .setFooter({ text: await functions1.tradutor(lang, "blackjack.perguntar") });

  const msg = await message.reply({ embeds: [embed] });

  const filtro = (m) => m.author.id === message.author.id;
  const collector = message.channel.createMessageCollector({
    filter: filtro,
    time: 60000,
  });

  collector.on("collect", async (m) => {
    if (m.content.toLowerCase() === "comprar" || m.content.toLowerCase() === "pedir" || m.content.toLowerCase() === "hit") {
      maoJogador.push(baralho.pop());
      valorJogador = calcularValor(maoJogador);

      if (valorJogador > 21) {
        collector.stop();
        await db.set(message.author.id, { money: money - aposta });
        return msg.edit({
          embeds: [
            embed
              .setDescription(
                `💵 **${await functions1.tradutor(lang, "blackjack.aposta")}:** ${api.ab(aposta)}\n\n❌ ${await functions1.tradutor(lang, "blackjack.estouro")} ${maoJogador
                  .map((c) => `${c.valor}${c.naipe}`)
                  .join(", ")} (Total: ${valorJogador})\n\n🤖 ${await functions1.tradutor(lang, "blackjack.dealer_blackjack")}`
              )
              .setFooter({ text: await functions1.tradutor(lang, "blackjack.fim") }),
          ],
        });
      }

      await msg.edit({
        embeds: [
          embed.setDescription(
            `💵 **${await functions1.tradutor(lang, "blackjack.aposta")}:** ${api.ab(aposta)}\n\n🃏 **${await functions1.tradutor(lang, "blackjack.mao_jogador")}:** ${maoJogador
              .map((c) => `${c.valor}${c.naipe}`)
              .join(", ")} (Total: ${valorJogador})\n🤖 **${await functions1.tradutor(lang, "blackjack.mao_dealer")}:** ${maoBot[0].valor}${maoBot[0].naipe}`
          ),
        ],
      });
    } else if (m.content.toLowerCase() === "parar" || m.content.toLowerCase() === "plantarte" || m.content.toLowerCase() === "stand") {
      collector.stop();

      while (valorBot < 17) {
        maoBot.push(baralho.pop());
        valorBot = calcularValor(maoBot);
      }

      let resultado = "";
      if (valorBot > 21 || valorJogador > valorBot) {
        resultado = `🎉 ${await functions1.tradutor(lang, "blackjack.vitoria")}`;
        await db.set(message.author.id, { money: money + aposta });
      } else if (valorJogador === valorBot) {
        resultado = `🤝 ${await functions1.tradutor(lang, "blackjack.empate")}`;
      } else {
        resultado = `💀 ${await functions1.tradutor(lang, "blackjack.derrota")}`;
        await db.set(message.author.id, { money: money - aposta });
      }

      await msg.edit({
        embeds: [
          embed
            .setDescription(
              `💵 **${await functions1.tradutor(lang, "blackjack.aposta")}:** ${api.ab(aposta)}\n\n🃏 **${await functions1.tradutor(lang, "blackjack.mao_jogador")}:** ${maoJogador
                .map((c) => `${c.valor}${c.naipe}`)
                .join(", ")} (Total: ${valorJogador})\n🤖 **${await functions1.tradutor(lang, "blackjack.mao_dealer")}:** ${maoBot
                .map((c) => `${c.valor}${c.naipe}`)
                .join(", ")} (Total: ${valorBot})\n\n${resultado}`
            )
            .setFooter({ text: await functions1.tradutor(lang, "blackjack.fim") }),
        ],
      });
    }
  });

  collector.on("end", async (_, reason) => {
    if (reason === "time") {
      msg.edit({
        embeds: [
          embed.setFooter({
            text: await functions1.tradutor(lang, "blackjack.timeout"),
          }),
        ],
      });
    }
  });
};

exports.help = {
  name: "blackjack",
  aliases: ["bj"],
  description: "Jogue Blackjack contra o bot com apostas.",
  status: true,
};
