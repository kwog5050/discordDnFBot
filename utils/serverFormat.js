// 서버 영어로 치환
const serverFormat = (server) => {
    let returnText = '';
    switch (server) {
        case '카인':
            returnText = 'cain';
            break;
        case '디레지어':
            returnText = 'diregie';
            break;
        case '시로코':
            returnText = 'siroco';
            break;
        case '프레이':
            returnText = 'prey';
            break;
        case '카시야스':
            returnText = 'casillas';
            break;
        case '힐더':
            returnText = 'hilder';
            break;
        case '안톤':
            returnText = 'anton';
            break;
        case '바칼':
            returnText = 'bakal';
            break;
        default:
            returnText = '없음';
            break;
    }

    return returnText;
}

module.exports = { serverFormat };