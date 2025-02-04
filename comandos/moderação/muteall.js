const Discord = require('discord.js')
const { QuickDB } = require("quick.db");
const db = new QuickDB();

exports.run = async(client, message, args) => {

    const functions = require("../../functions.js")
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: await functions.tradutor(await functions.getServerLanguage(message.guild.id), "manutenção")});
    }
    if(!message.member.permissions.has(Discord.PermissionFlagsBits.MuteMembers)) return message.reply("Você precisa da permissão \`Mute members\`")
const voiceChannel = message.member.voice.channel;


if (!voiceChannel) {
  message.channel.send('Você precisa estar em um canal de voz para usar este comando.');
  return;
}


voiceChannel.members.forEach((member) => {
  
  const voiceState = member.voice;

  
  voiceState.setMute(true);
});


message.channel.send('Todos os membros foram silenciados com sucesso.');

}

exports.help = {
    name: "muteall",
    aliases:[

    ],
    description: "Muta todos os usuários em uma chamada"
}