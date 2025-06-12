require('dotenv').config();
const keepAlive = require("./server.js");
const axios = require("axios");
const cheerio = require("cheerio");
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { serverFormat } = require('./utils/serverFormat.js');
const { filterDate } = require('./utils/filterDate.js');
const { getRandomChannel } = require('./utils/randomChannel.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

const prefix = "!";

client.once("ready", () => {
    console.log("Ready!");
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    // if (message.channel.name !== "") {
    //     message.channel.send("여기서 부르지 마세요");
    //     return;
    // }

    const content = message.content;
    const num = content.match(/\b\d+(\.\d+)?\b/g);
    const regexArr = [/.*사용법.*/, /.*캐릭터.*/, /.*모험단.*/,/.*채널추천.*/];
    const box = "```";

    if (regexArr[0].test(content)) {
        message.channel.send(`
            **사용방법** \n${box}!캐릭터 서버 캐릭터명\n!모험단 모험단명\n!채널추천${box}
        `);
    } else if (regexArr[1].test(content)) {
        try {
            const textArr = content.trim().split(/\s+/);

            const server = serverFormat(textArr[1]);
            const name = textArr.slice(2).join(" ");
            const characterInfo = await getCharacter(name, server);

            let getItems = '';
            if(characterInfo.data.getItemList.length){
                getItems = characterInfo.data.getItemList
                    .map(item => `${item.date} ${item.data.itemName} (${item.data.itemRarity})`)
                    .join('\n');
            }else{
                getItems = 'ㅋㅋ 3일동안 하나도 먹은게 없네';
            }

            let ratio = Number(characterInfo.data.getItemRatio.ancient) / Number(characterInfo.data.getItemRatio.epic);

            const embed = new EmbedBuilder()
                .setTitle(`${name}님 캐릭터 정보`)
                .setImage(`https://img-api.neople.co.kr/df/servers/${server}/characters/${characterInfo.data.id}?zoom=1`)
                .addFields([
                    { 
                        name: `모험단 ${characterInfo.data.adventure}`, 
                        value: "", 
                        inline: true 
                    },
                    { name: "", value: "" },
                    { 
                        name: characterInfo.data.buff !== undefined 
                            ? "버프력" 
                            : "데미지", 
                        value: characterInfo.data.buff !== undefined 
                            ? characterInfo.data.buff[1] !== undefined && characterInfo.data.buff[2] !== undefined
                                ? `2인 ${String(characterInfo.data.buff[0])}\n 3인 ${String(characterInfo.data.buff[1])}\n 4인 ${String(characterInfo.data.buff[2])}`
                                : String(characterInfo.data.buff[0])
                            : String(characterInfo.data.totalDamage), 
                        inline: true 
                    },
                    { name: "", value: "" },
                    { 
                        name: "장착중인 세트 정보", 
                        value: String(characterInfo.data.setsName + " " + characterInfo.data.setsGrade + " " + characterInfo.data.setsPoint || '정보 없음'), 
                        inline: true 
                    },
                    { name: "", value: "" },
                    { 
                        name: "태초 비율 (현재 캐릭만 계산됨)", 
                        value: String(ratio.toFixed(3)), 
                        inline: true 
                    },
                    { name: "", value: "" },
                    { 
                        name: "최근 3일 아이템 획득 현황", 
                        value: getItems, 
                        inline: true 
                    },
                ])
                .setColor("Purple");

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel('던담')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://dundam.xyz/character?server=${server}&key=${characterInfo.data.id}`),
                    new ButtonBuilder()
                        .setLabel('던파기어')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://dfgear.xyz/character?sId=${server}&cId=${characterInfo.data.id}&cName=${name}`),
                    new ButtonBuilder()
                        .setLabel('던지피티')
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://dungpt.kr/character-info?name=${name}&server=${server}`)
                );

                message.channel.send({
                    embeds: [embed],
                    components: [row],
                });
        } catch (error) {
            message.channel.send('니 얼굴 에러');
        }
    }else if(regexArr[2].test(content)){
        try {
            const textArr = content.trim().split(/\s+/);

            const name = textArr.slice(1).join(" ");
            const advenRes = await getAdven(name);
            
            let advenList = '';
            if(advenRes.data.characters.length){
                advenList = advenRes.data.characters
                    .map(item => `${item.name} (${item.buffScore !== undefined ? item.buffScore : item.ozma})\n`)
                    .join('\n');
            }else{
                advenList = '캐릭터 없음';
            }
    
            const embed = new EmbedBuilder()
            .setTitle(`${name}님 모험단 캐릭터리스트`)
            .addFields([
                { 
                    name: " ", 
                    value: String(advenList), 
                    inline: true 
                },
            ])
            .setColor("Purple");

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('던담')
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://dundam.xyz/search?server=adven&name=${name}`)
            );
    
            message.channel.send({
                embeds: [embed],
                components: [row],
            });
        } catch (error) {
            message.channel.send('니 얼굴 에러');
        }
    }else if(regexArr[3].test(content)){
        const radomChannel = getRandomChannel();
        let text = '';
        let image = '';
        let imageRandom01 = [
            'https://res.cloudinary.com/dfeglkqjy/image/upload/v1749711174/%EC%A0%91%EC%96%B4_yyksys.png',
            'https://res.cloudinary.com/dfeglkqjy/image/upload/v1749710821/%EC%B0%BE%EC%95%98%EB%8B%A4_ivdkub.webp',
            'https://res.cloudinary.com/dfeglkqjy/image/upload/v1749711037/%ED%8A%B9%EA%B2%80_aqsesz.png',
            'https://res.cloudinary.com/dfeglkqjy/image/upload/v1749714869/%EA%B9%A1_okwkm2.png',
            'https://res.cloudinary.com/dfeglkqjy/image/upload/v1749717062/%ED%91%9C%EB%8F%85_nhj0je.png',
        ];
        let imageRandom02 = [
            'https://res.cloudinary.com/dfeglkqjy/image/upload/v1749714879/%EB%B8%9C%ED%9E%88%ED%9E%88_nrsnj3.png',
            'https://res.cloudinary.com/dfeglkqjy/image/upload/v1749714865/%EC%97%86%EB%83%90_u1ngqi.png',
            'https://res.cloudinary.com/dfeglkqjy/image/upload/v1749714853/%EB%B6%88%ED%96%89_afctdo.png',
            'https://res.cloudinary.com/dfeglkqjy/image/upload/v1749717062/%ED%9D%A1%EC%A1%B1_zft0mu.png',
            'https://res.cloudinary.com/dfeglkqjy/image/upload/v1749717062/%EC%9C%BC%ED%9E%88%ED%9E%88_mhcbar.png'
        ];
        
        if(radomChannel.name === '꽝'){
            text = '오늘 태초가 안뜸 ㅋㅋㅋㅋ';
            image = imageRandom02[Math.floor(Math.random() * imageRandom02.length)]
        }else{
            text = `${radomChannel.name} ${radomChannel.channel}채널`
            image = imageRandom01[Math.floor(Math.random() * imageRandom01.length)]
        }

        const embed = new EmbedBuilder()
            .setTitle(`당신의 태초 채널!`)
            .setImage(image)
            .addFields([
                { 
                    name: text, 
                    value: '', 
                    inline: true 
                },
            ])
            .setColor("Purple");

            message.channel.send({ embeds: [embed], });
    }else{
        message.channel.send('니 얼굴');
    }
});

// 캐릭터 정보
async function getCharacter (name, server){
    try {
        const characterRes = await axios.post(`https://dundam.xyz/dat/searchData.jsp?name=${encodeURIComponent(name)}&server=${server}`, {});
        const character = characterRes.data.characters.find(c => c.name === name);

        const characterInfoRes = await axios.get(`https://dundam.xyz/dat/viewData.jsp?image=${character.key}&server=${server}&`);

        const getItem = await axios.get(`https://dungpt.kr/dnf/filtered-items?characterName=${name}&server=${server}`);
        
        const getItemRatio = await axios.get(` https://dungpt.kr/dnf/user/query4?characterId=${characterInfoRes.data.id}&serverId=${server}`);

        if(character.buffScore){
            characterInfoRes.data.buff = [character.buffScore, character.buffScore3, character.buffScore4];
        }else{
            characterInfoRes.data.totalDamage = character.ozma;
        }
        characterInfoRes.data.getItemList = filterDate(getItem.data);

        characterInfoRes.data.getItemRatio = { ancient: 0, epic: 0 };

        for (let i = 0; i < getItemRatio.data.length; i++) {
            characterInfoRes.data.getItemRatio.ancient = getItemRatio.data[i].ancient_count + characterInfoRes.data.getItemRatio.ancient;
            characterInfoRes.data.getItemRatio.epic = getItemRatio.data[i].epic_count + characterInfoRes.data.getItemRatio.epic;
        }

        return characterInfoRes;
    } catch (error) {
        console.error("캐릭터 정보 조회 실패:", error);
    }
};

// 모험단 정보
async function getAdven (name){
    try {
        const advenRes = await axios.post(`https://dundam.xyz/dat/searchData.jsp?name=${encodeURIComponent(name)}&server=adven`, {});

        return advenRes;
    } catch (error) {
        console.error("모험단 정보 조회 실패:", error);
    }
};

// 서버 실행
keepAlive();

// 디스코드 봇 로그인
// client.login(process.env.TOKEN);
client.login(process.env.DISCORD_TOKEN);