require('dotenv').config();
const keepAlive = require("./server.js");
const axios = require("axios");
const cheerio = require("cheerio");
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { serverFormat } = require('./utils/serverFormat.js');
const { filterDate } = require('./utils/filterDate.js');

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

    // if (message.channel.name !== "검은사막") {
    //     message.channel.send("여기서 부르지 마세요");
    //     return;
    // }

    const content = message.content;
    const num = content.match(/\b\d+(\.\d+)?\b/g);
    const regexArr = [/.*사용법.*/, /.*캐릭터.*/];
    const box = "```";

    if (regexArr[0].test(content)) {
        message.channel.send(`
            ${box}!캐릭터 서버 캐릭터명${box}
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
                    .map(item => `${item.date} ${item.data.itemName}`)
                    .join('\n');
            }else{
                getItems = 'ㅋㅋ 어제 오늘 하나도 먹은게 없네';
            }

            const embed = new EmbedBuilder()
                .setTitle(`${name}님 캐릭터 정보`)
                .setImage(`https://img-api.neople.co.kr/df/servers/${server}/characters/${characterInfo.data.id}?zoom=1`)
                .addFields([
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
                        name: "어제 오늘 아이템 획득 현황", 
                        value: getItems, 
                        inline: true 
                    },
                ])
                .setColor("Purple");

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            message.channel.send('니 얼굴 에러');
        }
    }else{
        message.channel.send('니 얼굴');
    }
});

// 캐릭터 정보
async function getCharacter (name, server){
    try {
        const targetUrl = `https://dundam.xyz/dat/searchData.jsp?name=${encodeURIComponent(name)}&server=${server}`;
        const characterRes = await axios.post(targetUrl, {});
        const character = characterRes.data.characters.find(c => c.name === name);

        const characterInfoRes = await axios.get(`https://dundam.xyz/dat/viewData.jsp?image=${character.key}&server=${server}&`);

        const getItem = await axios.get(`https://dungpt.kr/dnf/filtered-items?characterName=${name}&server=${server}`);

        if(character.buffScore){
            characterInfoRes.data.buff = [character.buffScore, character.buffScore3, character.buffScore4];
        }else{
            characterInfoRes.data.totalDamage = character.ozma;
        }
        characterInfoRes.data.getItemList = filterDate(getItem.data);

        console.log(character);

        return characterInfoRes;
    } catch (error) {
        console.error("캐릭터 정보 조회 실패:", error);
    }
};

// 서버 실행
keepAlive();

// 디스코드 봇 로그인
// client.login(process.env.TOKEN);
client.login(process.env.DISCORD_TOKEN);