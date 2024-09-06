const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async (client, message, args) => {
    try {
        const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
        if (message.author.id !== client.dev.id && status == false) return message.reply({ content: "Este comando está em manutenção!" });

        if (!message.member.permissions.has('ManageMessages')) return message.reply("Você não tem permissão para ver avisos de membros.");

        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!member && args.length > 0) {
        const usernameOrDisplayName = args.join(' ');
        member = message.guild.members.cache.find(u => u.user.username.toLowerCase() === usernameOrDisplayName.toLowerCase() || `${u.user.username.toLowerCase()}#${u.user.discriminator}` === usernameOrDisplayName.toLowerCase());
    }
        if (!member) return message.reply("Você deve mencionar um usuário válido.");

        const warnings = (await db.get(`warnings_${member.id}`)) || [];

        if (warnings.length === 0) {
            return message.reply("Este usuário não tem avisos registrados.");
        }

        const warnsPerPage = 2;
        let currentPage = 0;
        const totalPages = Math.ceil(warnings.length / warnsPerPage);

        const generateEmbed = (page) => {
            const embed = new EmbedBuilder()
                .setTitle(`Avisos de ${member.user.username} - Página ${page + 1}/${totalPages}`)
                .setColor(client.cor)
                .setThumbnail(member.user.displayAvatarURL())
              

            const start = page * warnsPerPage;
            const end = start + warnsPerPage;

            warnings.slice(start, end).forEach((warning, index) => {
                embed.addFields({
                    name: `Aviso ${start + index + 1}`,
                    value: `**Motivo:** ${warning.reason}\n**Data:** ${new Date(warning.date).toLocaleString('pt-BR')}\n**Moderador:** <@${warning.moderator}>\n**REF:** ${warning.messageURL ? `[Clique aqui](${warning.messageURL})` : "Sem link de Referência"}`,
                });
            });

            return embed;
        };

        const embedMessage = await message.reply({
            embeds: [generateEmbed(currentPage)],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('previous')
                        .setLabel('◀️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('▶️')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(currentPage === totalPages - 1)
                )
            ]
        });

        const filter = i => i.user.id === message.author.id;
        const collector = embedMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'previous') {
                currentPage--;
            } else if (i.customId === 'next') {
                currentPage++;
            }

            await i.update({
                embeds: [generateEmbed(currentPage)],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('previous')
                            .setLabel('◀️')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === 0),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('▶️')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(currentPage === totalPages - 1)
                    )
                ]
            });
        });

        collector.on('end', () => {
            embedMessage.edit({ components: [] });
        });

    } catch (error) {
        console.log(error)
        client.setError(error, `Erro ao executar o comando ${this.help.name}`);
        message.reply({ content: "Ocorreu um erro ao tentar executar este comando. O erro foi registrado e será analisado." });
    }
};

exports.help = {
    name: "warns",
    aliases: [],
    description: "Lista todos os avisos de um membro, com sistema de páginas. {prefixo}warns [user]",
    status: false
};
