
// 오늘 어제만 데이터 필터
function filterDate(items) {
    const now = new Date();

    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yyyyy = yesterday.getFullYear();
    const ymm = String(yesterday.getMonth() + 1).padStart(2, '0');
    const ydd = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayStr = `${yyyyy}-${ymm}-${ydd}`;

    return items.filter(item => {
        const itemDateStr = item.date.split(' ')[0];
        return itemDateStr === todayStr || itemDateStr === yesterdayStr;
    });
}

module.exports = { filterDate };