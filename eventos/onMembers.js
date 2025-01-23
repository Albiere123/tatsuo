const db = (new (require("../database.js"))("Event-MemberAdd"))

const Discord = require("discord.js")

exports.run = async (member, client) => {
    let database = await db.get(member.guild.id)
    if(database?.ligado != null && database?.ligado == true && database.canal != null) {
        let string = ``;
        if(database.titulo) string += `# **${database?.titulo}**\n`;
        if(database.descricao) string += `${database?.descricao}`;
        if(!string) string+= "ㅤ";
        string = string.replaceAll("{user}", member.user.username).replaceAll("{server}", "member.guild.name").replaceAll("{@user}", `<@${member.id}>`)
        let embed = new Discord.EmbedBuilder()
        .setDescription(string)
        .setColor(client.cor)
        .setThumbnail(database.thumbnail ? database.thumbnail:null)
        .setImage(database.image ? database.image : null);
        
        member.guild.channels.cache.get(database?.canal).send({embeds: [embed]})

    }

}