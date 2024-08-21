const Discord = require("discord.js");
const os = require("os");
const { version } = require('process');

const status = true;

exports.run = async (client, message, args) => {
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }

    const botInfo = {
        osType: os.type(), osRelease: os.release(), totalMemory: (os.totalmem() / 1024 / 1024).toFixed(2) + ' MB', freeMemory: (os.freemem() / 1024 / 1024).toFixed(2) + ' MB', cpuArch: os.arch(), nodeVersion: version, uptime: formatUptime(client.uptime) 
    };

    const embed = new Discord.EmbedBuilder()
        .setColor(client.cor)
        .setThumbnail(client.user.avatarURL({ size: 4096, extension: 'png' })) 
        .setDescription(`# <:mfone:820694403113943081> | Informações sobre mim
ㅤ
> **[ <:atencao:966746839003066368> ] Informações da Host**
ㅤ
- **( <:pasta:820693985877557278> ) Sistema Operacional:** ${botInfo.osType}${botInfo.osRelease}
ㅤ
- **( <a:cd:820694078295244830> ) Arquitetura do Processador:** ${botInfo.cpuArch}
ㅤ
- **( <:njs:820694985224618055> ) Ambiente de execução:** Node.js [${botInfo.nodeVersion}]
ㅤ
- **( <:djs:820694871114907658> ) Livraria:** Discord.js(14.15.3)
ㅤ
- **( <:ssd:820694050675097601> ) Memória RAM Total:** ${botInfo.totalMemory}
ㅤ
- **( <:vpn:820694291235340361> ) Memória RAM Livre:** ${botInfo.freeMemory}
ㅤ
> **[ <:estrela:966742154863079424> ] Informações do Bot**
ㅤ
- **( <a:cd:820694078295244830> ) Tempo de Atividade:** ${botInfo.uptime}
ㅤ
- **( <:calendario:966745154444738570> ) Aniversário de Programação:** 14/08/24 14:53
ㅤ
- **( <:cafe:820694213866946591> ) Developer:** ${client.dev.displayName}
`);

    message.reply({ embeds: [embed] });
}

function formatUptime(uptime) {
    const totalSeconds = Math.floor(uptime / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return`${days}d ${hours}h ${minutes}m ${seconds}s`;
}

exports.help = {
    name: "botinfo",
    aliases: ["info", "infobot", "bi"],
    description: "Mostra informações sobre o bot. Usage: {prefixo}botinfo",
    status: status
}
