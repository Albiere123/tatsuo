const Discord = require("discord.js");
const os = require("os");
const { version } = require('process');
const {QuickDB} = require('quick.db')
const db = new QuickDB()
exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) ? (await db.get(`${this.help.name}_privado`)) : false;
    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: "Este comando está em manutenção!" });
    }
    let cmds = 0;
    client.comandos.forEach(cmd => {if(cmd.help.description) cmds++})
    const botInfo = {
        osType: os.type(), osRelease: os.release(), totalMemory: (os.totalmem() / 1024 / 1024).toFixed(2) + ' MB', freeMemory: (os.freemem() / 1024 / 1024).toFixed(2) + ' MB', cpuArch: os.arch(), nodeVersion: version, uptime: formatUptime(client.uptime) 
    };

    const embed = new Discord.EmbedBuilder()
        .setColor(client.cor)
        .setThumbnail(client.user.avatarURL({ size: 4096, extension: 'png' })) 
        .setDescription(`# <:mudar:1275650265206493276> Informações sobre mim
ㅤ
> ** <:descricaodotrabalho:1275839638631612487> Descrição**
    \`A aplicação "Tatsuo" é um bot focado em utilidades e economia, ao mesmo tempo, tendo muitos comandos de economia e moderação.\`
ㅤ
> ** <:pesquisa:1275839827199398013> Informações Gerais**
- **<:guia:1275650254384926781> Comandos:** \`${client.comandos? cmds : 0}\`
- **<:paradownload:1275838205505179759> Canais:** \`${client.channels.cache.size}\`
- **<:adicionarusuario:1275650271929827440> Usuários:** \`${client.users.cache.size}\`
- **<:lista:1275656990013526076> Servidores:** \`${client.guilds.cache.size}\`
ㅤ
> ** <:global:1275650280850984961> Informações da Host**
- **<:pasta:820693985877557278> Sistema Operacional:** ${botInfo.osType}${botInfo.osRelease}
- **<a:cd:820694078295244830> Arquitetura do Processador:** ${botInfo.cpuArch}
- **<:njs:820694985224618055> Ambiente de execução:** Node.js [${botInfo.nodeVersion}]
- **<:djs:820694871114907658> Livraria:** Discord.js(14.15.3)
- **<:ssd:820694050675097601> Memória RAM Total:** ${botInfo.totalMemory}
- **<:vpn:820694291235340361> Memória RAM Livre:** ${botInfo.freeMemory}
ㅤ
> ** <:celebracao:1277780212368539698> Informações do Bot**
- **<:latencia1:1275850306839773316> Tempo de Atividade:** ${botInfo.uptime}
- **<:calendario:966745154444738570> Aniversário de Programação:** 14/08/24 14:53
- **<:cafe:820694213866946591> Developer:** ${client.dev.displayName ? client.dev.displayName : client.dev.username}

> ** <:aviaodepapel:1275650291357847583> Links**
- **<:batepapo:1275650282616918068> Support:** [Clique Aqui](https://discord.gg/mFCWWrmznx)
- **<:alarme:1275650257673388062> Página Top.gg:** [Clique Aqui](https://top.gg/bot/1271092944761389179)
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
    status: false
}
