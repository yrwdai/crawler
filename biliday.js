const async = require('async');
const cheerio = require('cheerio')

const userArr = [
    '927587',
    "1444345",
    "27487296",
    "8261672",
    "6556819",
    "15155522",
    "2296159",
    "86726843",
    "288469282",
    "117816866",
    "32226209",
    "359679",
    "20351164",
    "25150941",
    "20351164",
    "8209606",
    "6556819",
    "20633",
    "143433221",
"39895225",
"25399521",
"17452933",
"25150941",
"552347",
"15587708",
"1834319",
"2723616",
"2489407",
"25150941",
"2489407",
"15494945",
"36262903",
"49894286",
"1563520",
"34485272",
"14977280",
"57736622",
"68435235",
"34485272",
"2432783",
"107285612",
"117816866",
"3420908",
"10884840",
"44271100",
"58183",
"5418771",
"7636796",
"4547016",
"14029771",
"2570298",
"25150941",
"10892049",
"181296",
"7505173",
"25443700",
"17757509",
"20633",
"36063342",
"43325661",
"6785147",
"13866642",
"14721054",
"280051369",
"2972618",
]



const _config_url = {
    userinfo1: 'https://api.bilibili.com/x/space/upstat?mid=',
    userinfo2: 'https://api.bilibili.com/x/web-interface/card?mid=',
    videolist: 'https://space.bilibili.com/ajax/member/getSubmitVideos?mid=',
    videoBaseData: 'https://api.bilibili.com/x/web-interface/archive/stat?aid=',
    indexHtml: 'https://www.bilibili.com/video/av',
    danmuUrl: 'https://comment.bilibili.com/',
    commentUrl: "https://api.bilibili.com/x/v2/reply?type=1&oid="

}


const biliday = {
    init() {
        console.log("huya---start")
        let _t = this
        _t.getUserBaseData.init();
        _t.getUserVideo.init();
    },
    getUserBaseData: {
        init() {
            let _t = this;
            for (const userId of userArr) {
                _t.getDataFun(userId)
            }
        },
        getDataFun(userId) {
            let _t = this
            async.parallel([
                function (next) {
                    let _url = `${_config_url.userinfo1}${userId}`
                    let _options = selectProxy(_url)
                    getData(_options, function (data) {
                        data = JSON.parse(data)
                        next('', data);
                    });
                },
                function (next) {
                    let _url = `${_config_url.userinfo2}${userId}`
                    let _options = selectProxy(_url)
                    getData(_options, function (data) {
                        data = JSON.parse(data)
                        next('', data);
                    });
                },
            ], function (err, rst) {
                // the results array will equal ['one','two'] even though
                // the second function had a shorter timeout.
                if (err) throw err;
                _t.handle(rst, userId)
            })

        },
        handle(data, userId) {
            try {
                let _data = {
                    'platform': 'bilibili',
                    'type': 'userBaseData',
                    'userId': `${userId}`,
                    'totalPlay': `${data[0].data.archive.view}`,
                    'follower': `${data[1].data.follower}`,
                    'name': `${data[1].data.card.name}`
                }
                sendData(_data)
            } catch (e) {}
        }
    },
    getUserVideo: {
        init() {
            let _t = this;
            for (let userId of userArr) {
                _t.getDataFun(userId, 1)
            }
        },
        getDataFun(userId, page) {
            let _url = `${_config_url.videolist}${userId}&pagesize=100&page=${page}`
            let _options = selectProxy(_url)
            let _t = this
            getData(_options, function (data) {
                data = JSON.parse(data)
                _t.handle(userId, data, page)
            });
        },
        handle(userId, ret, page) {
            let videoIdArr = []
            data = ret.data,
                date = new Date(getMonthTime('lastmonth')),
                time = Date.parse(date),
                newPage = true,
                totalPage = data.pages,
                _t = this,
                _this = biliday,
                _index = 1

            for (let item of data.vlist) {
                let created = parseInt(item.created + '000')
                if (created > time) {
                    videoIdArr.push(item.aid)
                    _index++
                } else {
                    newPage = false
                }
            }
            if (totalPage > page && newPage) {
                page++
                _t.getDataFun(userId, page)
            }

            _this.getVideoBaseData.init(videoIdArr, userId);
            _this.getDanmu.init(videoIdArr, userId);
            _this.getComment.init(videoIdArr, userId);
        }
    },
    getVideoBaseData: {
        init(videoIdArr, userId) {
            let _t = this;
            for (let avId of videoIdArr) {
                let _url = `${_config_url.videoBaseData}${avId}`
                let _options = selectProxy(_url)
                let _t = this
                getData(_options, function (data) {
                    data = JSON.parse(data)
                    _t.handle(avId, userId, data)
                });
            }
        },
        handle(avId, userId, pdata) {
            let _data = {
                'platform': 'bilibili',
                'type': 'videoBaseData',
                'userId': `${userId}`,
                'videoId': `${avId}`,
                'coin': `${pdata.data.coin}`,
                'share': `${pdata.data.share}`,
                'favorite': `${pdata.data.favorite}`
            }
            sendData(_data)
        }
    },
    getDanmu: {
        init(videoIdArr, userId) {
            let _t = this;
            for (let avId of videoIdArr) {
                _t.getHtml(avId, userId)
            }
        },
        getHtml(avId, userId) {
            let _url = `${_config_url.indexHtml}${avId}`
            let _options = selectProxy(_url)
            let _t = this
            getData(_options, function (data) {
                _t.getDanmuData(avId, userId, data)
            });

        },
        getDanmuData(avId, userId, pdata) {
            let str = pdata.replace(/\r\n/g, "")
            str = str.replace(/\n/g, "");
            str = str.replace(/\s/g, "");

            let cid = str.match(/&amp;cid=(\S*)&amp;page/)[0]
            cid = cid.match(/&amp;cid=(\S*)&amp;page/)[1]


            let _url = `${_config_url.danmuUrl}${cid}.xml`
            let _options = selectProxy(_url)
            let _t = this
            getData(_options, function (data) {
                const $ = cheerio.load(data)
                let danmuarr = []

                let nowtime = getMonthTime('time');
                nowtime = Date.parse(nowtime)
                let lasttime = nowtime - 3600000


                for (let i = $("d").length; i >= 0; i--) {
                    if ($("d").eq(i).attr("p") == undefined) {
                        continue
                    }
                    let arr = $("d").eq(i).attr("p").split(",")
                    let itemTime = arr[4]
                    itemTime = parseInt(itemTime + '000')
                    if (lasttime <= itemTime && nowtime > itemTime) {
                        danmuarr.push({
                            'content': $("d").eq(i).text(),
                            'sendId': arr[3]
                        })
                    } else {
                        break;
                    }
                }
                _t.handle(avId, userId, danmuarr)
            });
        },
        handle(avId, userId, danmuarr) {
            let _data = {
                'platform': 'bilibili',
                'type': 'danmu',
                'userId': `${userId}`,
                'videoId': `${avId}`
            }

            let num = 10
            for (let row = 0; row < Math.ceil(danmuarr.length / num); row++) {
                row += 1
                _data['content'] = danmuarr.slice((row - 1) * num, num * row)
                sendData(_data)
            }

        }
    },
    getComment: {
        init(videoIdArr, userId) {
            let _t = this;
            for (let avId of videoIdArr) {
                _t.getdata(avId, userId, 1)
            }
        },
        getdata(avId, userId, page) {
            let _url = `${_config_url.commentUrl}${avId}&pn=${page}`
            let _options = selectProxy(_url)
            let _t = this
            getData(_options, function (data) {
                data = JSON.parse(data)
                _t.handle(userId, data, page, avId)
            });
        },
        handle(userId, pdata, page, avId) {
            let lengthRpy = pdata['data']['replies'].length,
                arr = [],
                _t = this,
                _Continue = true
            if (lengthRpy != 0) {
                for (let i = 0; i < lengthRpy; i++) {
                    let comMsg = pdata['data']['replies'][i]['content']['message']
                    let sendId = pdata['data']['replies'][i]['member']['mid']
                    let comTime = pdata['data']['replies'][i]['ctime']
                    arr = _t.addCommentItem(arr, comTime, comMsg, sendId)
                    // ts_pastTime,ts_newTime = getTime()
                    comTime = parseInt(comTime + '000')
                    let nowtime = getMonthTime('time'),
                        lasttime = Date.parse(nowtime) - 3600000
                    if (comTime < lasttime) {
                        _Continue = false
                    }
                    let leng = pdata['data']['replies'][i]['replies'].length
                    for (let j = 0; j < leng; j++) {
                        let comMsgRp = pdata['data']['replies'][i]['replies'][j]['content']['message']
                        let sendId = pdata['data']['replies'][i]['replies'][j]['member']['mid']
                        let comTime = pdata['data']['replies'][i]['replies'][j]['ctime']
                        arr = _t.addCommentItem(arr, comTime, comMsgRp, sendId)
                    }
                }
                if (_Continue) {
                    page++
                    _t.getdata(avId, userId, page)
                }
                if(arr.length<=0){
                    return false
                }
                let _data = {
                    'platform': 'bilibili',
                    'type': 'comment',
                    'userId': `${userId}`,
                    'videoId': `${avId}`,
                    'content': arr
                }
                sendData(_data)

            }
            // console.log(lengthRpy)
        },
        addCommentItem(arr, comTime, content, sendId) {
            comTime = parseInt(comTime + '000')
            let nowtime = getMonthTime('time');
            nowtime = Date.parse(nowtime)
            let lasttime = nowtime - 3600000
            // ts_pastTime,ts_newTime = getTime()
            // danmu = []
            if (lasttime <= comTime && nowtime > comTime) {
                arr.push({
                    "content": content,
                    "sendId": sendId
                })
            }
            return arr
        }
    }
}

module.exports = biliday