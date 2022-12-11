/*自習室機能 VC部分*/
const { Client, GatewayIntentBits, Partials,GuildMember} = require('discord.js');
const fs = require('fs');
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
const date = JSON.parse(fs.readFileSync('./studyroom.json', 'utf8'));
const config = require('../config.json')

exports.func = async function studyroom(oldState, newState){
    let time = new Date();
    let UNIX=time.getTime()/1000; //UNIXTime
    let user=date.date.find(date => date.uid === oldState.id); /*その人のデータ*/
    if(user === undefined){
        date.date.push({
                "uid": "",
                "name": "",
                "icon":"",
                "lastJoin": 0,
                "study":[0,0,0,0,0,0,0],
                "StudyAll": 0,
                "task":[0,0,0,0,0,0,0],
                "TaskAll": 0,
                "now": false,
                "StudyWeek": [0,0,0,0],
                "TaskWeek": [0,0,0,0],
                "guild":[oldState.guild.id]
            })
        date.date[date.date.length - 1].uid = String(newState.id); //id取得
        user=date.date[date.date.length - 1];

    }
    //名前とアイコンの更新
    let userDate=await client.users.fetch(newState.id);
    let username = userDate.username;
    let discriminator=userDate.discriminator;
    let icon = userDate.displayAvatarURL()
    let members =
    user.name = username + '#' + discriminator;
    user.icon = icon;


    let userPoint = date.date.indexOf(user) /*その人のデータの位置*/
    if(oldState.channel===null){
        if(config.studyVC.indexOf(newState.channelId)!==-1){
            console.log(user.name+" join VC");
            user.lastJoin = UNIX; //参加した時刻を書き込み
            user.now = true;
            for(let i=0;i<user.guild.length;i++){
                let role = config.role.find(date => date.guild === user.guild.at(i));
                let guild = client.guilds.cache.get(user.guild.at(i))
                await guild.members.addRole({
                    user: newState.id,
                    role: role.id
                })
            }
        }
    }
    else if(newState.channel===null){
        if(config.studyVC.indexOf(oldState.channelId)!==-1){
            user.StudyAll += UNIX-user.lastJoin;
            user.study[0] += UNIX-user.lastJoin;
            console.log(user.name+" leave VC");
            user.now = false;
        }
    }
    else{
        if(config.studyVC.indexOf(oldState.channelId)!==-1){
            user.StudyAll += UNIX-user.lastJoin;
            user.study[0] += UNIX-user.lastJoin;
            user.now = false;
        }
        if(config.studyVC.indexOf(newState.channelId)!==-1){
            user.lastJoin = UNIX; //参加した時刻を書き込み
            user.now = true;
        }
        console.log(user.name+" change VC");
    }
    date.date[userPoint]=user
    fs.writeFileSync('./studyroom.json', JSON.stringify(date,null ,"\t")); //json書き出し
}


exports.update = function (){
    /*0時に切断したことにする*/
    let time = new Date();
    let UNIX=time.getTime()/1000; //UNIXTime
    UNIX=UNIX-(UNIX%86400)-32400+86400; //今日の0時

    let now = date.date.filter(function(item, index){ /*今入ってる人を列挙*/
        if (item.now === true ) return true;
    });
    for(let i=0; i<now.length; i++){
        let user = now[i]; /*その人のデータ*/
        let userPoint = date.date.indexOf(user) /*その人のデータの位置*/
        /*切断と同様の処理*/
        user.StudyAll += UNIX-user.lastJoin;
        user.study[0] += UNIX-user.lastJoin;
        /*参加と同じ処理*/
        console.log(user.name+"さんがVCに入ったまま日付をまたぎました！");
        user.lastJoin = UNIX;
        date.date[userPoint]=user
    }

    //月曜日に週の記録書き込み
    let dt = new Date();
    let dayofweek = dt.getDay();
    if (dayofweek === 3) {
        for(let i=0;i<date.date.length;i++){
            for(let j=4;j>0;j--){
                date.date[i].studyWeek[j] = date.date[i].studyWeek[j-1];
            }
            date.date[i].studyWeek[0] = date.date[i].study.reduce((sum, element) => sum + element, 0);;
        }
    }

    /*日付を1日ずらす作業*/
    for(let i=0;i<date.date.length;i++){
        for(let j=6;j>0;j--){
            date.date[i].study[j] = date.date[i].study[j-1];
        }
        date.date[i].study[0] = 0;
    }
    for(let i=0;i<date.date.length;i++){
        for(let j=6;j>0;j--){
            date.date[i].task[j] = date.date[i].task[j-1];
        }
        date.date[i].task[0] = 0;
    }
    fs.writeFileSync('./studyroom.json', JSON.stringify(date,null ,"\t")); //json書き出し
}

client.login(config.token);