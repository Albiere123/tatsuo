const Discord = require('discord.js');
const CustomDB = require('../../database');
const db = new CustomDB();
const { QuickDB } = require("quick.db");
const qdb = new QuickDB();
const ms = require('ms');
const { v4: uuidv4 } = require('uuid');

exports.run = async (client, message, args) => {
    const status = (await db.get(`${this.help.name}_privado`)) || false;
    if (message.author.id !== client.dev.id && !status) return message.reply({ content: "Este comando está em manutenção!" });
    let embed = new Discord.EmbedBuilder();
    
    if(!message.guild.members.cache.get(message.author.id).permissions.has(Discord.PermissionFlagsBits.CreateEvents)) {
        client.setError(embed, `Você não possue a permissão \`CREATE EVENTS\``)
        client.setUsage(embed, `${client.prefix}sorteio <tempo> <premio>`)
        return message.reply({embeds: [embed]})
    }
    

    const canall = (await qdb.get(`dashboard.${message.guild.id}.canais`))?.sorteios;
    if (!canall || !canall.id) {
        client.setError(embed, "Parece que o canal de sorteios ainda não foi definido... Peça para um staff com as permissões de GERENCIAR CANAIS defini-lo na dashboard!");
        client.setUsage(embed, `${client.prefix}sorteio <tempo> <prêmio>`);
        return message.reply({ embeds: [embed] });
    }

    const canal = await client.channels.cache.get(canall.id);
    if (!canal) {
        client.setError(embed, "O canal de sorteio configurado é inválido ou não existe.");
        client.setUsage(embed, `${client.prefix}sorteio <tempo> <prêmio>`);
        return message.reply({ embeds: [embed] });
    }

    const botPerms = canal.permissionsFor(client.user);

    if (!botPerms.has(Discord.PermissionFlagsBits.SendMessages)) {
        return message.reply({ content: "Eu não tenho permissão para enviar mensagens no canal de sorteios configurado." });
    }

    if (!botPerms.has(Discord.PermissionFlagsBits.EmbedLinks)) {
        return message.reply({ content: "Eu não tenho permissão para enviar embeds no canal de sorteios configurado." });
    }

    if (!botPerms.has(Discord.PermissionFlagsBits.AddReactions)) {
        return message.reply({ content: "Eu não tenho permissão para adicionar reações no canal de sorteios configurado." });
    }

    if (!botPerms.has(Discord.PermissionFlagsBits.ManageMessages)) {
        return message.reply({ content: "Eu não tenho permissão para gerenciar mensagens no canal de sorteios configurado." });
    }

    if (!botPerms.has(Discord.PermissionFlagsBits.UseExternalEmojis)) {
        return message.reply({ content: "Eu não tenho permissão para usar emojis externos no canal de sorteios configurado." });
    }

    if (!botPerms.has(Discord.PermissionFlagsBits.ReadMessageHistory)) {
        return message.reply({ content: "Eu não tenho permissão para ler o histórico de mensagens no canal de sorteios configurado." });
    }

    const tempo = args[0];
    if (!tempo) {
        client.setError(embed, "Você precisa especificar um tempo para o sorteio.");
        client.setUsage(embed, `${client.prefix}sorteio <tempo> <prêmio>`);
        return message.reply({ embeds: [embed] });
    }

    const duration = ms(tempo);
    if (!duration) {
        client.setError(embed, "Formato de tempo inválido. Use algo como 1h1m1s.");
        client.setUsage(embed, `${client.prefix}sorteio <tempo> <prêmio>`);
        return message.reply({ embeds: [embed] });
    }

    const premio = args.slice(1).join(' ');
    if (!premio) {
        client.setError(embed, "Você precisa especificar um prêmio para o sorteio.");
        client.setUsage(embed, `${client.prefix}sorteio <tempo> <prêmio>`);
        return message.reply({ embeds: [embed] });
    }

    const sorteioId = uuidv4();
    const chaveDb = `sorteios.${message.guild.id}.${sorteioId}`;

    const sorteioData = {
        premio: String(premio),
        tempo: String(tempo),
        endTime: Date.now() + duration,
        participantes: [],
        mensagemId: null,
        canalId: canal.id
    };

    

    try {
        await db.set(chaveDb, sorteioData);
        const savedData = await db.get(chaveDb);
        
    } catch (error) {
        console.error("Erro ao salvar os dados do sorteio:", error);
    }

    function formatCountdown(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / (24 * 60 * 60));
        const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    const endTime = sorteioData.endTime;
    const timestamp = `<t:${Math.floor(endTime / 1000)}:R>`;

    const sorteioEmbed = new Discord.EmbedBuilder()
        .setTitle('<:celebracao:1277780212368539698> Sorteio Iniciado!')
        .setDescription(`Prêmio: **${premio}**\nTempo: **${args[0]}**\nAcaba em:** ${timestamp}**`)
        .setColor(client.cor)
        .setFooter({text: `Aguarde ao menos 5 segundos para entrar no sorteio!`})
        .setThumbnail("https://cdn-icons-png.flaticon.com/128/5029/5029895.png");

    const botoes = new Discord.ActionRowBuilder()
        .addComponents(
            new Discord.ButtonBuilder()
                .setCustomId(`toggle_sorteio_${sorteioId}`)
                .setLabel('Entrar/Sair')
                .setStyle(Discord.ButtonStyle.Success),
            new Discord.ButtonBuilder()
                .setCustomId(`ver_participantes_${sorteioId}`)
                .setLabel('Ver Participantes')
                .setStyle(Discord.ButtonStyle.Primary)
        );

    const mensagem = await canal.send({ embeds: [sorteioEmbed], components: [botoes] });
    

    sorteioData.mensagemId = mensagem.id;
    try {
        await db.set(chaveDb, sorteioData);
        
    } catch (error) {
        console.error("Erro ao atualizar os dados do sorteio:", error);
    }
};

exports.help = {
    name: "sorteio",
    aliases: [],
    description: "Inicia um sorteio com canal pré-configurado, tempo e prêmio especificados. Usage: !sorteio <tempo> <prêmio>",
    status: false
};

exports.help.iniciarColetores = async function(client) {
    const todosOsSorteios = await db.all();

    for (const entry of todosOsSorteios) {
        if (entry.key.startsWith('sorteios.')) {
            const [ , guildId, sorteioId ] = entry.key.split('.');
            const sorteioData = entry.value;
            const tempoAtual = Date.now();

            if (sorteioData.endTime > tempoAtual) {
                const canal = await client.channels.cache.get(sorteioData.canalId);
                if (canal && sorteioData.mensagemId) {
                    try {
                        const mensagem = await canal.messages.fetch(sorteioData.mensagemId);

                        if (mensagem) {
                            const filtro = i => i.customId.startsWith(`toggle_sorteio_${sorteioId}`) || i.customId.startsWith(`ver_participantes_${sorteioId}`);
                            const coletor = mensagem.createMessageComponentCollector({ filtro, time: sorteioData.endTime - tempoAtual });

                            coletor.on('collect', async i => {
                                try {
                                    if (i.replied || i.deferred) return;

                                    const userId = i.user.id;

                                    if (i.customId.startsWith(`toggle_sorteio_${sorteioId}`)) {
                                        const sorteioAtualizado = await db.get(`sorteios.${guildId}.${sorteioId}`);
                                        if (!sorteioAtualizado) {
                                            await i.reply({ content: "O sorteio não foi encontrado.", ephemeral: true });
                                            return;
                                        }

                                        let participantesAtualizados = sorteioAtualizado.participantes;
                                        if (participantesAtualizados.includes(userId)) {
                                            participantesAtualizados = participantesAtualizados.filter(id => id !== userId);
                                            sorteioAtualizado.participantes = participantesAtualizados;
                                            await db.set(`sorteios.${guildId}.${sorteioId}`, sorteioAtualizado);
                                            await i.reply({ content: `Você saiu do sorteio.`, ephemeral: true });
                                        } else {
                                            participantesAtualizados.push(userId);
                                            sorteioAtualizado.participantes = participantesAtualizados;
                                            await db.set(`sorteios.${guildId}.${sorteioId}`, sorteioAtualizado);
                                            await i.reply({ content: `Você entrou no sorteio.`, ephemeral: true });
                                        }
                                    } else if (i.customId.startsWith(`ver_participantes_${sorteioId}`)) {
                                        const sorteioAtualizado = await db.get(`sorteios.${guildId}.${sorteioId}`);
                                        if (!sorteioAtualizado) {
                                            await i.reply({ content: "O sorteio não foi encontrado.", ephemeral: true });
                                            return;
                                        }

                                        const listaParticipantes = sorteioAtualizado.participantes.length ? `<@${sorteioAtualizado.participantes.join('>\n<@')}>` : "Nenhum participante ainda.";
                                        await i.reply({ content: `Participantes:\n${listaParticipantes}`, ephemeral: true });
                                    }
                                } catch (error) {

                                }
                            });

                            coletor.on('end', async collected => {
                                try {
                                    const sorteioFinalizado = await db.get(`sorteios.${guildId}.${sorteioId}`);
                                    if (sorteioFinalizado) {
                                        const vencedor = sorteioFinalizado.participantes[Math.floor(Math.random() * sorteioFinalizado.participantes.length)];
                                        canal.send(vencedor ? `<@${vencedor}> ganhou o prêmio de **${sorteioFinalizado.premio}**!` : "Sorteio cancelado!\nNenhum participante encontrado...");
                                        const sorteioEmbed = new Discord.EmbedBuilder()
        .setTitle('<:celebracao:1277780212368539698> Sorteio Iniciado!')
        .setDescription(`Prêmio: **${sorteioData.premio}**\nTempo: **${sorteioData.tempo}**\nAcaba em:** Sorteio encerrado.**`)
        .setColor(client.cor)
        .setThumbnail("https://cdn-icons-png.flaticon.com/128/5029/5029895.png");
                                        await db.delete(`sorteios.${guildId}.${sorteioId}`);
                                        canal.messages.cache.get(sorteioData.mensagemId).edit({embeds: [sorteioEmbed], components: []})
                                        
                                    }
                                } catch (error) {
                                    console.error("Erro ao processar a mensagem do sorteio:", error);
                                }
                            });
                        }
                    } catch (error) {
                        console.error("Erro ao buscar a mensagem do sorteio:", error);
                    }
                }
            } else {
                
                await db.delete(entry.key);
            }
        }
    }
};
