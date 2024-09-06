const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } = require('discord.js');
const moment = require("moment");
moment.locale("pt-BR");

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status === false) return message.reply({ content: "Este comando está em manutenção!" });

    let mentionedUser = message.mentions.users.first() || client.users.cache.get(args[0]);

    if (!mentionedUser && args.length > 0) {
        const usernameOrDisplayName = args.join(' ');
        mentionedUser = client.users.cache.find(u => u.username.toLowerCase() === usernameOrDisplayName.toLowerCase() || `${u.username.toLowerCase()}#${u.discriminator}` === usernameOrDisplayName.toLowerCase());
    }

    if (!mentionedUser) mentionedUser = message.author;
    let user = mentionedUser;
    const member = message.guild.members.cache.get(user.id);

    // Embeds das páginas
    const pages = [
        new Discord.EmbedBuilder()
            .setTitle(`Página 1 - Informações Básicas`)
            .setColor(client.cor)
            .addFields(
                { name: "<:doutilizador:1275838621043396681> Usuário", value: `${user.username}#${user.discriminator}`, inline: false },
                { name: "<:alarme:1275650257673388062> ID", value: user.id, inline: false },
                { name: "<:descricaodotrabalho:1275839638631612487> Conta criada em", value: moment(user.createdAt).format('LLL'), inline: false },
                { name: "<:adicionarusuario:1275650271929827440> Entrou no servidor em", value: moment(member.joinedAt).format('LLL'), inline: false }
            ).setThumbnail(user.avatarURL()),
        new Discord.EmbedBuilder()
            .setTitle(`Página 2 - Cargos`)
            .setColor(client.cor)
            .addFields(
                { name: "<:carteiradeidentidade2:1275650276954603631> Cargos", value: member.roles.cache.filter(role => role.name != "@everyone").map(role => `<@&${role.id}>`).join(", ") || "Nenhum cargo", inline: false }
            ).setThumbnail(user.avatarURL()),
        new Discord.EmbedBuilder()
            .setTitle(`Página 3 - Informações Adicionais`)
            .setColor(client.cor)
            .addFields(
                { name: "<:servidor:1275850903349366895> É um bot?", value: user.bot ? "Sim" : "Não", inline: false },
                { name: "<:notificacao:1275650250740072581> Status", value: member.presence?.status || "Offline", inline: false },
                { name: "<:minecraft:1275841564610138189> Cargo mais alto", value: member.roles.highest.name, inline: false }
            )
            .setThumbnail(user.avatarURL())
            ,
    ];

    let currentPage = 0;

    const components = (state) => [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("prevPage")
                .setLabel("◀️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(state === 0),
            new ButtonBuilder()
                .setCustomId("nextPage")
                .setLabel("▶️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(state === pages.length - 1)
        ),
    ];

    const initialMessage = await message.reply({ embeds: [pages[currentPage]], components: components(currentPage) });

    const filter = (i) => i.user.id === message.author.id;
    const collector = initialMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000, filter });

    collector.on("collect", async (interaction) => {
        if (interaction.customId === "prevPage") {
            currentPage--;
        } else if (interaction.customId === "nextPage") {
            currentPage++;
        }
        await interaction.update({ embeds: [pages[currentPage]], components: components(currentPage) });
    });

    collector.on("end", () => {
        initialMessage.edit({ components: [] });
    });
};

exports.help = {
    name: "userinfo",
    aliases: ["user", "uinfo"],
    description: "Exibe informações detalhadas sobre um usuário. Usage: {prefixo}userinfo [user]",
    status: false
};
