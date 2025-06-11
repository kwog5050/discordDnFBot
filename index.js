require('dotenv').config();
const keepAlive = require("./server.js");
const axios = require("axios");
const cheerio = require("cheerio");
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
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
    const regexArr = [/.*사용법.*/, /.*캐릭터.*/, /.*모험단.*/];
    const box = "```";

    if (regexArr[0].test(content)) {
        message.channel.send(`
            **사용방법** \n${box}!캐릭터 서버 캐릭터명\n !모험단 모험단명${box}
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
                        .setLabel('던지피지')
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
        message.channel.send('니 얼굴 아직임');
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

        if(character.buffScore){
            characterInfoRes.data.buff = [character.buffScore, character.buffScore3, character.buffScore4];
        }else{
            characterInfoRes.data.totalDamage = character.ozma;
        }
        characterInfoRes.data.getItemList = filterDate(getItem.data);

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