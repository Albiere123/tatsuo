const Discord = require("discord.js");
const CustomDB = require("../../database");
const db = new CustomDB("wiki");
const {QuickDB} = require("quick.db")
const db1 = new QuickDB() 

/*const categorias = Object.keys(data).map((cat) => {
            const comandos = Object.keys(data[cat])
                .map((cmd) => `• ${cmd}`)
                .join("\n");
            return `**${cat}**\n${comandos}`;
        });*/

exports.run = async (client, message, args) => {

    const status = (await db1.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && status == false) {
        const embed = new Discord.EmbedBuilder();
        client.setError(embed, "Este comando está em manutenção!");
        return message.reply({ embeds: [embed] });
    }

    const subCommand = args[0]?.toLowerCase();
    const categoria = args[1];
    const categorias = [
        "discord.js", "aoi.js", "discord.py", "bdfd"
    ]
    const titulo = args[2];
    const codigo = args.slice(3).join(" ");

    let embed = new Discord.EmbedBuilder();

    if (subCommand === "add") {
        if (!categoria || !titulo || !codigo) {
            client.setUsage(embed, `\`${client.prefix}wiki add <categoria> <título> <código>\``);
            return message.reply({ embeds: [embed] });
        }
        if(!categorias.includes(categoria)) {
            client.setError(embed, `A categoria não foi encontrada na whitelist... Contate o desenvolvedor caso for um erro!
Categorias disponiveis: \`${categorias.join("`, `")}\``)
            client.setUsage(embed, `\`${client.prefix}wiki add <categoria> <título> <código>\``);
            return message.reply({ embeds: [embed] });
        }
        const data = (await db.get("wiki")) || {};
        if (!data[categoria]) data[categoria] = {};
        data[categoria][titulo] = codigo;

        await db.set("wiki", data);
        embed.setColor(client.cor).setDescription(
            `Comando adicionado na categoria **${categoria}** com o título **${titulo}**!`
        );
        return message.reply({ embeds: [embed] });
    }

    if (subCommand === "list") {
        const data = (await db.get("wiki")) || {};
        if (Object.keys(data).length === 0) {
            client.setError(embed, "A wiki está vazia no momento.");
            return message.reply({ embeds: [embed] });
        }

        const categorias = Object.keys(data);
        const buttons = categorias.map((cat) =>
            new Discord.ButtonBuilder()
                .setLabel(cat)
                .setStyle(Discord.ButtonStyle.Primary)
                .setCustomId(`wiki_cat_${cat}`)
        );

        const row = new Discord.ActionRowBuilder().addComponents(buttons);

        embed
            .setColor(client.cor)
            .setTitle("Lista de Categorias da Wiki")
            .setDescription("Clique em uma categoria abaixo para ver os comandos disponíveis.")
            .setFooter({ text: "Selecione uma categoria para continuar." });

        return message.reply({ embeds: [embed], components: [row] });
    }

    if (subCommand === "ver" && categoria && titulo) {
        const data = (await db.get("wiki")) || {};
        const categoriaData = data[categoria];

        if (!categoriaData || !categoriaData[titulo]) {
            client.setError(embed, `Nenhum comando encontrado para **${titulo}** na categoria **${categoria}**.`);
            return message.reply({ embeds: [embed] });
        }

        let codigo = categoriaData[titulo];
        if (!codigo.startsWith("```js")) codigo = "```js\n" + codigo + "\n```";
        embed
            .setColor(client.cor)
            .setTitle("**Titulo: "+titulo+"**")
            .setDescription(`${codigo}`)
            .setFooter({ text: `Categoria: ${categoria}` });

        return message.reply({ embeds: [embed] });
    }

    client.setUsage(
        embed,
        `- \`${client.prefix}wiki list\` para listar categorias e comandos\n- \`${client.prefix}wiki add <categoria> <título> <código>\` para adicionar um comando\n- \`${client.prefix}wiki ver <categoria> <título>\` para visualizar o código de um comando.`
    );
    return message.reply({ embeds: [embed] });
};

exports.help = {
    name: "wiki",
    aliases: [],
    description: "Gerencie ou consulte a wiki de comandos.",
    status: true,
};
