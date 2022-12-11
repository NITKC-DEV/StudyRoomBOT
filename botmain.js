const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder} = require('discord.js');
let config = require('./config.json')
const studyroom = require('./functions/studyRoom.js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
require('date-utils');
dotenv.config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,

    ],
    partials: [Partials.Channel],
});
module.exports.client=client;

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
client.commands = new Collection();
module.exports = client.commands;


/*スラッシュコマンド登録*/
client.once("ready", async () => {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        for (let i = 0; i < command.length; i++) {
            client.commands.set(command[i].data.name, command[i]);
        }

    }
    console.log("Ready!");
});

/*実際の動作*/
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;
    console.log("SlashCommand : "+command.data.name);
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'エラーが発生しました。[サポートサーバー](https://discord.gg/fpEjBHTAqy)にて連絡していただけると助かります。', ephemeral: true });
    }
});

/*自習室BOT(VC参加で通知)*/
client.on('voiceStateUpdate', (oldState, newState) => {
    studyroom.func(oldState, newState)
})

cron.schedule('0 0 * * *',() => {
    studyroom.update();
})

// ステータス設定
cron.schedule('* * * * *',() => {
    let date = new Date();
    let json = JSON.parse(fs.readFileSync('./studyroom.json', 'utf8'));
    let user = json.date.length
    let time = Math.floor(date.getTime() / 1000 / 60)%6
    let now = json.date.filter(function(item, index){ /*今入ってる人を列挙*/
        if (item.now === true ) return true;
    });

    if(time === 0){
        client.user.setPresence({
            activities: [{
                name: client.guilds.cache.size+"サーバーに導入中"
            }],
        });
    }
    else if(time === 1){
        client.user.setPresence({
            activities: [{
                name: user+"人のセーブデータ登録済み"
            }],
        });
    }
    else if(time === 2){
        client.user.setPresence({
            activities: [{
                name: "ヘルプ：/help"
            }],
        });
    }
    else if(time === 3){
        client.user.setPresence({
            activities: [{
                name: "日別データ：/studydate"
            }],
        });
    }
    else if(time === 4){
        client.user.setPresence({
            activities: [{
                name: "週別データ：/studyweek"
            }],
        });
    }
    else{
        client.user.setPresence({
            activities: [{
                name: now.length + "人が勉強中"
            }],
        });
    }
})

/*BOT参加時*/
client.on('guildCreate', async guild => {
    //ロール作成
    let role=config.role.find(item => item.guild === guild.id);
    const newRole = await guild.roles.create({
        name: 'Studying now',
        color: 0x00A0EA,
        reason: "StudyRoom BOTの操作により作成"
    });
    if(role === undefined){
        config.role.push({
            guild:guild.id,
            id:newRole.id
        })
    }
    else{
        let point = config.role.indexOf(role)
        config.role[point]={
            guild:guild.id,
            id:newRole.id
        }
    }
    fs.writeFileSync('./config.json', JSON.stringify(config,null ,"\t"));

    //お知らせ
    let embed = new EmbedBuilder()
        .setColor(0x00A0EA)
        .setTitle('StudyRoomBOTを導入していただきありがとうございます')
        .setAuthor({
            name: "StudyRoom DiscordBOT",
            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
            url: 'https://discord.com/invite/fpEjBHTAqy'
        })
        .setDescription('ボイスチャットに接続している時間を勉強している時間とみなし、勉強時間を記録してくれるBOTです。\n以下に簡単な説明を記載します。')
        .addFields(
            {
                name: "勉強時間記録方法",
                value: "対象のVCに接続するだけです。切断すると、記録は終了します。"
            },
            {
                name: "記録確認方法",
                value: "以下のコマンドで、データを確認できます。\n日別データ：/studydate\n週別データ：/studyweek"
            },
            {
                name: "その他",
                value: "わからないことがあれば、/help コマンドを使用してください。"
            },
            {
                name: "管理者の皆さんへ",
                value: "管理者向けのヘルプがあります。VCの追加方法等が書いてあるので、一度確認をお願いします。\n/admin を実行してください。"
            }
        )
        .setTimestamp()
        .setFooter({
            text: 'Developed by NITKC-22DEV',
            iconURL: 'https://avatars.githubusercontent.com/u/107338867?s=200&v=4'
        });
    client.channels.cache.get(guild.systemChannelId).send({embeds: [embed]});
})

client.login(config.token);
