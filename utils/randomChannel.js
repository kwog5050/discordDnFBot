const CHANNEL_DEFINITIONS = [
    { name: "벨마이어 공국", start: 1, end: 18 },
    { name: "지벤 황국", start: 1, end: 12 },
    { name: "마계", start: 1, end: 10 },
    { name: "바하이트", start: 1, end: 12 },
    { name: "백해", start: 1, end: 18 },
    { name: "중천", start: 40, end: 89 },
    { name: "꽝" },
];

function getRandomChannel() {
    const random = CHANNEL_DEFINITIONS[Math.floor(Math.random() * CHANNEL_DEFINITIONS.length)];

    const randomChannel = Math.floor(Math.random() * (random.end - random.start + 1)) + random.start;

    return {
        name: random.name,
        channel: randomChannel
    };
}

module.exports={ getRandomChannel }