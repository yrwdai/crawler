function getMonthTime(type) {
    let now = new Date();
    let year = now.getFullYear(); //年
    let month = now.getMonth() + 1; //月
    let day = now.getDate(); //日

    let hh = now.getHours(); //时
    let mm = now.getMinutes(); //分


    function add(num){
        if (num < 10){
            return '0'+num
        }else{
            return num
        }
    }
    function monthFun(month){
        let _month = month-1 == 0 ? 12: month-1;
        return add(_month) 
    }
    
    let clock = ''
    switch(type){
        case "lastmonth":
            clock = `${year}-${monthFun(month)}-${add(day)} ${add(hh)}:${add(mm)}:00:000`;
            break; 
        case "year":
            clock = year;
            break; 
        case "time":
            clock = `${year}-${add(month)}-${add(day)} ${add(hh)}:${00}:00:000`;
            break; 
    }
    return (clock);
}

module.exports = getMonthTime