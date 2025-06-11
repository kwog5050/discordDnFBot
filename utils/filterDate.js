
// 최근 3일 필터
function filterDate(items) {
    const now = new Date();

    const getDateStr = (dateObj) => {
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const todayStr = getDateStr(now);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = getDateStr(yesterday);

    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);
    const twoDaysAgoStr = getDateStr(twoDaysAgo);

    return items.filter(item => {
        const itemDateStr = item.date.split(' ')[0];
        return itemDateStr === todayStr || itemDateStr === yesterdayStr || itemDateStr === twoDaysAgoStr;
    });
}


module.exports = { filterDate };