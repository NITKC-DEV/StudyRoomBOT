const { Client, GatewayIntentBits, Partials, EmbedBuilder} = require('discord.js');
const fs = require('fs');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
    ],
    partials: [Partials.Channel],
});
const token = require('../config.json')


exports.bot = async function join(guild){
    let config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

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
            name: "StudyRoom BOT",
            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
            url: 'https://discord.com/invite/fpEjBHTAqy'
        })
        .setDescription('現在、このサーバーに参加しているユーザーのデータを作成しています。人数が多いと時間がかかる可能性があります。\n以下にこのBOTについての簡単な説明を記載します。')
        .addFields(
            {
                name:"概要",
                value:"ボイスチャットに接続している時間を勉強している時間とみなし、勉強時間を記録してくれるBOTです。"
            },
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
            },
        )
        .setTimestamp()
        .setFooter({
            text: 'Developed by NITKC-22DEV',
            iconURL: 'https://avatars.githubusercontent.com/u/107338867?s=200&v=4'
        });
    client.channels.cache.get(guild.systemChannelId).send({embeds: [embed]});

    //自習室データ作成・更新
    const guildMember = await guild.members.fetch()
    let date = JSON.parse(fs.readFileSync('./studyroom.json', 'utf8'));


    for(let i=0;i<guild.memberCount;i++){
        if(guildMember.at(i).user.bot === false){
            let userDate=await client.users.fetch(guildMember.at(i).user.id);
            let username = userDate.username;
            let discriminator=userDate.discriminator;
            let icon = userDate.displayAvatarURL()

            let user=date.date.find(date => date.uid === guildMember.at(i).user.id);
            let userPoint = date.date.indexOf(user)
            if(user === undefined){
                date.date.push({
                    "uid": guildMember.at(i).user.id,
                    "name": username + '#' + discriminator,
                    "icon":icon,
                    "lastJoin": 0,
                    "study":[0,0,0,0,0,0,0],
                    "StudyAll": 0,
                    "task":[0,0,0,0,0,0,0],
                    "TaskAll": 0,
                    "now": false,
                    "StudyWeek": [0,0,0,0],
                    "TaskWeek": [0,0,0,0],
                    "guild":[guild.id]
                })
            }
            else{
                if(date.date.at(userPoint).guild.includes(guild.id) === false){
                    date.date.at(userPoint).guild.push(guild.id)
                }
                date.date.at(userPoint).name = username + '#' + discriminator;//ついでにアイコンとか更新
                date.date.at(userPoint).icon = icon;
            }
            fs.writeFileSync('./studyroom.json', JSON.stringify(date,null ,"\t")); //json書き出し
        }
    }

}

exports.user = async function newUser(guild){
    let date = JSON.parse(fs.readFileSync('./studyroom.json', 'utf8'));
    let config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

    if(guild.user.bot === false){
        let userDate=await client.users.fetch(guild.user.id);
        let username = userDate.username;
        let discriminator=userDate.discriminator;
        let icon = userDate.displayAvatarURL()
        let userPoint = date.date.indexOf(date.date.find(date => date.uid === guild.user.id))
        if(userPoint === undefined){
            date.date.push({
                "uid": guild.user.id,
                "name": username + '#' + discriminator,
                "icon":icon,
                "lastJoin": 0,
                "study":[0,0,0,0,0,0,0],
                "StudyAll": 0,
                "task":[0,0,0,0,0,0,0],
                "TaskAll": 0,
                "now": false,
                "StudyWeek": [0,0,0,0],
                "TaskWeek": [0,0,0,0],
                "guild":[guild.id]
            })
        }
        else{
            if(date.date.at(userPoint).guild.includes(guild.id) === false){
                date.date.at(userPoint).guild.push(guild.id)
            }
            date.date.at(userPoint).name = username + '#' + discriminator;//ついでにアイコンとか更新
            date.date.at(userPoint).icon = icon;
        }
        fs.writeFileSync('./studyroom.json', JSON.stringify(date,null ,"\t")); //json書き出し
    }
}

exports.rmuser = async function rmUser(guild){
    let date = JSON.parse(fs.readFileSync('./studyroom.json', 'utf8'));
    let config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

    if(guild.user.bot === false){
        let userDate=await client.users.fetch(guild.user.id);
        let username = userDate.username;
        let discriminator=userDate.discriminator;
        let icon = userDate.displayAvatarURL()
        let userPoint = date.date.indexOf(date.date.find(date => date.uid === guild.user.id))
        if(userPoint === undefined){

        }
        else{
            await date.date.at(userPoint).guild.splice(date.date.at(userPoint).guild.indexOf(guild.id),1);
            date.date.at(userPoint).name = username + '#' + discriminator;//ついでにアイコンとか更新
            date.date.at(userPoint).icon = icon;
        }
        fs.writeFileSync('./studyroom.json', JSON.stringify(date,null ,"\t")); //json書き出し
    }
}

client.login(token.token);