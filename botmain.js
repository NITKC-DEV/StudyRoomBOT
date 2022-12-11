const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder} = require('discord.js');
let config = require('./config.json')
const studyroom = require('./functions/studyRoom.js');
const join = require('./functions/joinFunc.js')
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
                name: now.length + "人が勉強"
            }],
        });
    }
})

/*BOT参加時*/
client.on('guildCreate', async guild => {
    await join.bot(guild)
    console.log("ギルド参加処理")
})

/*ユーザー参加時*/
client.on('guildMemberAdd', async member => {
    await join.user(member)
    console.log("ユーザー参加処理")
})

/*ユーザー退出時*/
client.on('guildMemberRemove', async member => {
    await join.rmuser(member)
    console.log("ユーザー退出処理")
})

client.login(config.token);
