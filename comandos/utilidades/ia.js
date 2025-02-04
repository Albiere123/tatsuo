const Discord = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { Mistral } = require("@mistralai/mistralai");
const CustomDB = require("../../database.js")
const db2 = new CustomDB()
function sendLongMessage(messageContent, channel) {
    const maxMessageLength = 2000; // Máximo de caracteres permitidos por mensagem no Discord (2000)
    const messages = [];
  
    for (let i = 0; i < messageContent.length; i += maxMessageLength) {
      messages.push(messageContent.slice(i, i + maxMessageLength));
    }
  
    messages.forEach((msg, index) => {
      setTimeout(() => {
        channel.send(msg);
      }, index * 1000); // Envía as mensagens com um atraso de 1 segundo para evitar spam
    });
  }

exports.run = async (client, message, args) => {
    const functions = require("../../functions.js");
    const status = (await db.get(`${this.help.name}_privado`)) || false;

    if (message.author.id !== client.dev.id && status === false) {
        return message.reply({ content: await functions.tradutor(await functions.getServerLanguage(message.guild.id), "manutenção")});
    }
    
    if (!args[0]) return message.reply("Coloque algo para falar!");

    const mistral = new Mistral({
        apiKey: "FgsxSoh1IP2jlaZy2bKqCSO0YjJxG7OW",
    });

    try {
        const data = (await db2.get("wiki")) || {};
        const categoriaData = data["bdfd"];
        const response = await mistral.chat.complete({
            model: "mistral-medium",
            messages: [
                { role: "system", content: `Você é um assistente útil que responde apenas em português. Você server para tirar dúvidas de programação como: python, javascript, java, etc. Caso superar o limite de letras, envie duas mensagens! Além disso, quero que ajude devs que usam esta lingaguem
Discord bot designer, onde possuimos:
Use $ para chamar funções, abre para argumentos [, fecha com ]

Essas são todas as funções, darei uma descrição após ->:
$addField[Name;Value;(Inline?;Index)] -> adiciona uma field na embed
$addButton[New row?;Interaction ID/URL;Label;Style;(Disable?;Emoji;Message ID)] - adiciona um botão a mensagem
$addCmdReactions[Emojis;...] -> adiciona reações ao comando
$addEmoji[Name;Image URL;Return emoji?] -> adiciona um emoji ao servidor
$addMessageReactions[Channel ID;Message ID;Emojis;...] -> adiciona reação a mensagem especifica
$addReactions[Emojis;...] - adiciona reações a resposta do comando, enviada pelo bot
$addSelectMenuOption[Menu option ID;Label;Value;Description;(Default?;Emoji;Message ID)] -> adiciona uma opção ao select menu
$addTextInput[Text input ID;Style;Label;(Minimum length;Maximum length;Required?;Value;Placeholder)] -> adiciona uma nova field ao modal
$addTimestamp([index]) -> adiciona uma timestamp a embed
$allMembersCount -> retorna o total de usuarios de todos os servidores em que o bot está
$allowMention -> habilita menção no comando

$avatar[userID] -> retorna o avatar do userID
$author[text] -> author da embed
$authorID -> retorna o id do author da mensagem
$ban[Razão] -> bane o usuario mencionado pela razão citada, o argumento razão é o motivo do banimento
$changeUsername
$changeUsernameWithID
$channelID -> retorna o id do canal onde foi enviado a mensagem
$channelPosition
$channelSendMessage
$clear
$clearReactions
$color[cor em hex] -> adiciona cor a embed
$createChannel[Name;Type;(Category ID)] -> cria um canal no discord
$deleteIn
$deleteMessage
$deleteRole
$description
$displayName
$divide
$discriminator[USERID] -> retorna os numeros após a # do usuario USERID
$elif
$else
$endif
$emojiExists
$emojiName
$endif
$else
$endif
$if
$icon[serverID] -> retorna o icon do servidor cujo id foi citado
$image
$joinSplitText
$nomention
$ping
$random
$randomUserID
$repliedMessageID
$reply
$replyIn
$registerGuildCommands
$removeAllComponents
$removeButtons
$removeComponent
$removeContains
$removeEmoji
$removeLinks
$repeatMessage
$replaceText
$resetChannelVar
$resetServerVar
$resetUserVar
$roleCount
$roleExists
$roleGrant
$roleID
$roleInfo
$roleName
$roleNames
$rolePosition
$round
$scriptLanguage
$second
$sendEmbedMessage
$sendMessage
$serverChannelExists
$serverCooldown
$serverCount
$serverDescription
$serverEmojis
$serverIcon
$serverInfo
$serverLeaderboard
$serverName
$serverOwner
$serverRegion
$serverVerificationLvl
$setChannelVar
$setServerVar
$setUserVar
$setVar
$shardID
$slashCommandsCount
$slashID
$slowmode
$sort
$splitText
$startThread
$sub
$sum
$suppressErrors
$takeRole
$textSplit
$threadAddMember
$threadRemoveMember
$thumbnail
$time
$timeout
$title
$toLowerCase
$toTitleCase
$toUppercase
$trimContent
$trimSpace
$tts
$unban
$unbanID
$unmute
$unpinMessage
$unregisterGuildCommands
$untimeout
$uptime
$url
$useChannel
$userAvatar
$userBadges
$userBanner
$userBannerColor
$userExists
$userID
$userInfo
$userJoined
$userJoinedDiscord
$userLeaderboard
$username[USERID]
$userPerms
$userReacted
$userRoles
$userServerAvatar
$var
$varExistError
$varExists
$variablesCount
$year
$removeAllComponents
$removeButtons
$removeComponent
$removeContains
$removeEmoji
$removeLinks
$repeatMessage
$replaceText
$randomUserID
$registerGuildCommands
$roleCount
$roleExists
$roleGrant
$roleID
$roleInfo
$roleName
$roleNames
$rolePosition
$round
$scriptLanguage
$second
$sendEmbedMessage
$sendMessage
$serverChannelExists
$serverCooldown
$serverCount
$serverDescription
$serverEmojis
$serverIcon
$serverInfo
$serverLeaderboard
$serverName
$serverOwner
$serverRegion
$serverVerificationLvl
$setChannelVar
$setServerVar
$setUserVar
$setVar
$shardID
$slashCommandsCount
$slashID
$slowmode
$sort
$splitText
$startThread
$sub
$sum
$suppressErrors
$takeRole
$textSplit
$threadAddMember
$threadRemoveMember
$thumbnail
$time
$timeout
$title
$toLowerCase
$toTitleCase
$toUppercase
$trimContent
$trimSpace
$tts
$unban
$unbanID
$unmute
$unpinMessage
$unregisterGuildCommands
$untimeout
$uptime
$url
$useChannel
$userAvatar
$userBadges
$userBanner
$userBannerColor
$userExists
$userID
$userInfo
$userJoined
$userJoinedDiscord
$userLeaderboard
$username
$userPerms
$userReacted
$userRoles
$userServerAvatar
$var
$varExistError
$varExists
$variablesCount
$year
$removeEmoji
$removeLinks
$repeatMessage
$replaceText
$resetChannelVar
$resetServerVar
$resetUserVar
$roleCount
$roleExists
$roleGrant
$roleID
$roleInfo
$roleName
$roleNames
$rolePosition
$round
$scriptLanguage
$second
$sendEmbedMessage[Channel ID;Content;(Title;Title URL;Description;Color;Author;Author icon;Footer;Footer icon;Thumbnail;Image;Add timestamp?;Return ID?)]
$sendMessage[Text;(Return message ID?)]
$serverChannelExists
$serverCooldown
$serverCount
$serverDescription
$serverEmojis
$serverIcon
$serverInfo
$serverLeaderboard
$serverName
$serverOwner
$serverRegion
$serverVerificationLvl
$setChannelVar
$setServerVar
$setUserVar
$setVar
$shardID
$slashCommandsCount
$slashID
$slowmode
$sort
$splitText[Index] -> retorna o valor do $textSplit
$startThread
$sub
$sum
$suppressErrors
$takeRole
$textSplit[Text;Separator] -> corta a mensagem 
$threadAddMember
$threadRemoveMember
$thumbnail
$time
$timeout
$title
$toLowerCase
$toTitleCase
$toUppercase
$trimContent
$trimSpace
$tts
$unban
$unbanID
$unmute
$unpinMessage
$unregisterGuildCommands
$untimeout
$uptime
$url
$useChannel
$userAvatar
$userBadges
$userBanner
$userBannerColor
$userExists
$userID
$userInfo
$userJoined
$userJoinedDiscord
$userLeaderboard
$username
$userPerms
$userReacted
$userRoles
$userServerAvatar
$var
$varExistError
$varExists
$variablesCount
$year
$removeAllComponents
$removeButtons
$removeComponent
$removeContains
$removeEmoji
$removeLinks
$repeatMessage
$replaceText

exemplo comandos:
ping:
$nomention
Pong! \`$ping ms.\`

lembrete:
Variável: "lembretec"
valor: "0"

$onlyIf[$guildID!=;]

$textSplit[$var[t];.]
$var[t;$splitText[1]]
$textSplit[$noMentionMessage[1];]
$var[tf;$splitText[$getTextSplitLength]]
$var[m;$replaceText[$replaceText[$message;$noMentionMessage[1] ;;1];;;-1]]
$if[$noMentionMessage[1]==$var[m]]
$var[m;Não definido.]
$endif

$onlyIf[$isNumber[$var[t]]==true;Digite um formato de tempo correto. ( 30s, 1m, 5m )]
$onlyIf[$and[$var[t]<=80;$var[t]>=1]==true;Só é permitido no máximo **80 minutos**, e no mínimo **1 segundo**.]
$onlyIf[$and[$var[tf]!=;$isNumber[$var[tf]]==false]==true; Não encontrei nenhum formato de tempo.]
$cooldown[20s;]

$sendMessage[Irei te lembrar em **$var[t]$var[tf]**, para: $var[m]]
$var[ti;$getTimestamp]

$if[$and[$var[t]>40;$checkContains[$noMentionMessage[1] ;m]==true]==true]
$replyIn[40m]
$replyIn[$sub[$var[t];40]m]
$else
$replyIn[$var[t]$var[tf]]
$endif 
<@$authorID>, você pediu para eu te lembrar <t:$var[ti]:R>, para: $var[m]


$endif

daily:
$nomention
$setUserVar[Money;$sum[250;$getUserVar[Money]]]
$title[$username, aqui esta sua recompensa:]
$color[FFFFF1]
$description[voce ganhou $250]
$cooldown[24h;desculpe, espere 24 horas para o seu proximo daily-_-]

say:
Desculpe, não encontrei informações específicas sobre o comando "say" no BDFD nas fontes fornecidas.

para verificar se um usuário foi mencionado use:

$onlyIf[!=$mentioned[1];mencione alguem!]

No entanto, posso fornecer uma estrutura genérica para criar um comando personalizado em BDFD. Aqui está um exemplo de como você pode criar um comando de "say":

$if[$message[1]==say]
$title[Say]
$description[$message[2]]
$else
Comando inválido.
$endif
Neste código, o comando verifica se a primeira palavra da mensagem é "say". Se for, ele exibe um título "Say" e a descrição com o conteúdo da mensagem após o comando.

Lembre-se de ajustar o código de acordo com a sintaxe e as convenções do BDFD.

Infelizmente, não encontrei informações específicas sobre o comando "say" no BDFD nas fontes fornecidas.

exemplo de ticket:

comando base -> trigger: .startTicket
$nomention
$title[Atendimento]
$description[> Olá, se quiser falar com nossa equipe clique no botão abaixo.
Abra um ticket somente se quiser fazer reclamações, sugestões e tirar dúvidas.]
$color[#313338]
$image[SUA IMAGEM]
$addButton[no;Atendimento;Atendimento;secondary;no;🛡️]

interação do botão -> trigger: $onInteraction[Atendimento]
$nomention
$newTicket[ID DA SUA CATEGORIA DE TICKET;No Subject Hás Been Given;Bem-vindo(a) <@$authorID>

Ao finalizar o suporte digite .closeticket para fechar o Ticket. :lock:

;Ticket criado em {channel};error Please Try Again]

$clear[1]

comando de fechar ticket -> trigger: .closeTicket
$nomention
$modifyChannelPerms[$channelID;-sendmessages;$authorID]
$color[#313338]
$title[Fechar Ticket]
$description[Aperte no botão abaixo para fechar o ticket.]
$addButton[no;Fechar Ticket;Fechar Ticket;secondary;no;🚫]

interação do botão -> trigger: $onInteraction[Fechar Ticket]
$nomention
$closeTicket[An Error Occured.]
Seu Ticket foi fechado em $serverName[$guildID]
$dm


codigos na wiki para aprendizado em json: ${categoriaData}
` },
                { role: "user", content: args.join(" ") }
            ],
            max_tokens: 500
        });

        sendLongMessage(response.choices[0].message.content, message.channel);
    } catch (error) {
        console.error("Erro na API da Mistral:", error);
        message.reply("🚫 Erro ao acessar a IA. Tente novamente mais tarde!");
    }
};

exports.help = {
    name: "ia",
    aliases: [],
    description: "",
    status: false
};
