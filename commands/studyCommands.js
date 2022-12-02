const { SlashCommandBuilder, EmbedBuilder, GuildMember} = require('discord.js')
const fs = require("fs");
const date = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('studydate')
                .setDescription('自習室のデータを表示します')
                .addUserOption(option =>
                    option
                        .setName('ユーザー')
                        .setDescription('記録を見たいユーザーを指定します')
                        .setRequired(true)
                ),

            async execute(interaction) {
                //jsonの読み込みとユーザーデータの取り出し
                const date = JSON.parse(fs.readFileSync('./studyroom.json', 'utf8'));
                let option = interaction.options.data[0].value;
                let user=date.date.find(date => date.uid === option);
                let embed;
                if(user === undefined){
                    embed = new EmbedBuilder()
                        .setColor(0xD9D9D9)
                        .setTitle('データが見つかりません')
                        .setAuthor({
                            name: "StudyRoom DiscordBOT",
                            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                            url: 'https://discord.com/invite/fpEjBHTAqy'
                        })
                        .setDescription('データが存在しないか、破損しています。VCに参加してからもう一度試してください。それでもエラーが起きる場合は、管理者に連絡してください。')
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC-22DEV' ,iconURL: 'https://avatars.githubusercontent.com/u/107338867?s=200&v=4'});
                }
                else{

                    let hour = user.study.reduce((sum, element) => sum + element, 0)/3600;
                    let color;
                    let rank;
                    if(hour >= 48){
                        color = 0x6DBCD1
                        rank = "Platinum";
                    }
                    else if(hour >= 42){
                        color = 0xFFEB99
                        rank = "Gold";
                    }
                    else if(hour >= 35){
                        color = 0xF00400
                        rank = "Red";
                    }
                    else if(hour >= 24){
                        color = 0xF47A00
                        rank = "Orange"
                    }
                    else if(hour >= 20){
                        color = 0xBCBC00
                        rank = "Yellow"
                    }
                    else if(hour >= 14){
                        color = 0x0000F4
                        rank = "Blue"
                    }
                    else if(hour >= 10){
                        color = 0x00B5F7
                        rank = "Light Blue"
                    }
                    else if(hour >= 7){
                        color = 0x007B00
                        rank = "Green"
                    }
                    else if(hour >= 3){
                        color = 0x7C3E00
                        rank = "Brown"
                    }
                    else{
                        color = 0xD9D9D9
                        rank = "Gray"
                    }
                    let dt = new Date();
                    let date = [0,0,0,0,0,0,0];
                    let month = [0,0,0,0,0,0,0];
                    dt.setDate(dt.getDate()+1)
                    for(let i=0;i<7;i++){
                        dt.setDate(dt.getDate()-1);
                        month[i] = dt.getMonth()+1;
                        date[i] = dt.getDate();
                    }

                    embed = new EmbedBuilder()
                        .setColor(color)
                        .setTitle(user.name + 'の自習室データ')
                        .setAuthor({
                            name: "StudyRoom DiscordBOT",
                            iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                            url: 'https://discord.com/invite/fpEjBHTAqy'
                        })
                        .setThumbnail(user.icon)
                        .setDescription("現在のランク：" + rank)
                        .addFields(
                            {
                                name:"過去7日間の毎日のデータ",
                                value:month[6] + '/' + date[6] + "    " + Math.floor(user.study[6]/360)/10 + "時間\n" +month[5] + '/' + date[5] + "    " + Math.floor(user.study[5]/360)/10 + "時間\n" + month[4] + '/' + date[4] + "    " + Math.floor(user.study[4]/360)/10 + "時間\n" + month[3] + '/' + date[3] + "    " + Math.floor(user.study[3]/360)/10 + "時間\n" + month[2] + '/' + date[2] + "    " + Math.floor(user.study[2]/360)/10 + "時間\n" + month[1] + '/' + date[1] + "    " + Math.floor(user.study[1]/360)/10 + "時間\n" + month[0] + '/' + date[0] + "    " + Math.floor(user.study[0]/360)/10 + "時間\n"
                            },
                            {
                                name:"過去7日間の勉強時間",
                                value:Math.floor(hour*10)/10 + "時間"
                            },
                            {
                                name:"累計勉強時間",
                                value:Math.floor(user.StudyAll/360)/10 + "時間"
                            }
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Developed by NITKC-22DEV' ,iconURL: 'https://avatars.githubusercontent.com/u/107338867?s=200&v=4'});
                }
                await interaction.reply({ embeds: [embed] });
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('studyroom')
                .setDescription('Studyroom DiscordBOTの説明です'),
            async execute(interaction) {
                const embed = new EmbedBuilder()
                    .setColor(0x00A0EA)
                    .setTitle('About StudyRoom')
                    .setAuthor({
                        name: "StudyRoom DiscordBOT",
                        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                        url: 'https://discord.com/invite/fpEjBHTAqy'
                    })
                    .setDescription('ボイスチャットに接続している時間を勉強している時間とみなし、勉強時間を記録してくれるツールです。')
                    .addFields(
                        {
                            name:"対象ボイスチャット",
                            value:"コマンドで自習室に追加すると、対象のVCに追加できます。\n管理者は、以下のコマンドで追加や削除を行えます。\n追加：/studyroomadd\n削除：/studyroomdel"
                        },
                        {
                            name:"データ確認方法",
                            value:"/studydate コマンドを使用してください。なお、一度も記録をしてない場合はデータがないので、対象のボイスチャットに一度参加してから実行してみてください。"
                        },
                        {
                            name:"ランク",
                            value:"直近7日間の勉強時間に応じて、ランクが設定されます。ランクは以下のように設定されています。\n\n白金：48時間以上\n金色：42時間以上\n赤色：35時間以上\n橙色：24時間以上\n黄色：20時間以上\n青色：14時間以上\n水色：10時間以上\n緑色：7時間以上\n茶色：3時間以上\n灰色：3時間未満\n\n※このデータは小数点以下切り捨てで表示されるため、すべての値を合計しても合計値に届かないことがあります。"
                        },
                        {
                            name:"サポート",
                            value:"エラーの報告や、質問、新機能の提案等はこちらの[サポートサーバー](https://discord.com/invite/fpEjBHTAqy)で対応しています。"
                        },/*
                        {
                            name:"招待リンク",
                            value:"[こちらのリンク](https://00m.in/gY6eP)から招待することができます。"
                        }*/


                    )
                    .setTimestamp()
                    .setFooter({ text: 'Developed by NITKC-22DEV' ,iconURL: 'https://avatars.githubusercontent.com/u/107338867?s=200&v=4'});
                await interaction.reply({ embeds: [embed] });
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('studyroomadd')
                .setDefaultMemberPermissions(1<<3) //管理者専用
                .setDescription('現在参加しているVCを自習室に追加します。'),
            async execute(interaction) {
                //現在入ってるVC取得
                let user = interaction.user.id
                let guild = interaction.guild

                if (guild.members.guild.voiceStates.cache.size === 0){
                    await interaction.reply({ content: '追加したいVCに参加してから実行してください。', ephemeral: true });
                }
                else{
                    //現在入ってるVC取得 その2
                    let id = guild.members.guild.voiceStates.cache.get(user).channelId
                    let name = guild.channels.cache.get(id).name

                    const date = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
                    let VC=date.studyVC.find(el => el === id);
                    if(VC === undefined){
                        date.studyVC.push(id)
                        fs.writeFileSync('./config.json', JSON.stringify(date,null ,"\t"));
                        await interaction.reply({ content: name + "(ID:"+ id + ")" + "を自習室に追加しました", ephemeral: true });
                    }
                    else{
                        await interaction.reply({ content: name + "(ID:"+ id + ")" + "はすでに自習室に追加されています。", ephemeral: true });
                    }
                }

            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('studyroomdel')
                .setDefaultMemberPermissions(1<<3) //管理者専用
                .setDescription('現在参加しているVCを自習室から削除します。'),
            async execute(interaction) {

                //現在入ってるVC取得
                let user = interaction.user.id
                let guild = interaction.guild

                if (guild.members.guild.voiceStates.cache.size === 0){
                    await interaction.reply({ content: '削除したいVCに参加してから実行してください。', ephemeral: true });
                }
                else{
                    //現在入ってるVC取得 その2
                    let id = guild.members.guild.voiceStates.cache.get(user).channelId
                    let name = guild.channels.cache.get(id).name

                    const date = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
                    let VC=date.studyVC.find(item => item === id);
                    if(VC === undefined){
                        await interaction.reply({ content: name + "(ID:"+ id + ")" + "は自習室に追加されていません。/studyroomadd コマンドで追加できます。", ephemeral: true });
                    }
                    else{
                        date.studyVC=date.studyVC.filter(item => item !== id)
                        fs.writeFileSync('./config.json', JSON.stringify(date,null ,"\t"));
                        await interaction.reply({ content: name + "(ID:"+ id + ")" + "を自習室から削除しました", ephemeral: true });

                    }
                }
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('twitter')
                .setDescription('Twitter連携の設定を行います'),
            async execute(interaction) {

                let first,firstv,second,secondv;
                if(false){ //Twitterアカウント連携の有無確認
                    first = ":regional_indicator_a: Twitterアカウントデータ削除"
                    firstv = "Twitterアカウントのデータを削除します。同時に、自動投稿も停止されます。"
                    if(false){ //今週の記録投稿の有無確認
                        second = ":regional_indicator_b: 今週の記録投稿 - 停止"
                    }
                    else{
                        second = ":regional_indicator_b: 今週の記録投稿 - 有効化"
                    }
                }
                else{
                    first = ":regional_indicator_a: Twitterアカウント接続"
                    firstv = "Twitterアカウントに接続をして、自動投稿の設定ができるようにします。"

                    second = ":regional_indicator_b: 今週の記録投稿 - 有効化"
                }
                const embed = new EmbedBuilder()
                    .setColor(0x1D9BF0)
                    .setTitle('Twitter連携機能設定')
                    .setAuthor({
                        name: "StudyRoom DiscordBOT",
                        iconURL: 'https://media.discordapp.net/attachments/1004598980929404960/1039920326903087104/nitkc22io-1.png',
                        url: 'https://discord.com/invite/fpEjBHTAqy'
                    })
                    .setDescription('Twitter連携機能の設定を行います。設定したい項目の絵文字をリアクションしてください。')
                    .addFields(
                        {
                            name:first,
                            value:firstv
                        },
                        {
                            name:second,
                            value:"毎週末に投稿される「今週の記録」の投稿の設定を切り替えます。"
                        },



                    )
                    .setTimestamp()
                    .setFooter({ text: 'Developed by NITKC-22DEV' ,iconURL: 'https://avatars.githubusercontent.com/u/107338867?s=200&v=4'});
                interaction.client.users
                    .fetch(interaction.user.id)
                    .then(async (user) => {
                        const dm = await user.send({embeds: [embed]});
                        await dm.react("🇦")
                        await dm.react("🇧")
                    });
                await interaction.reply({ content: "ダイレクトメッセージを送信しました。確認してください。", ephemeral: true });
            },
        },
    ]