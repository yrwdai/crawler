const async = require('async');
const cheerio = require('cheerio')

const userArr = ['927587']



const _config_url = {
    userinfo1: 'https://api.bilibili.com/x/space/upstat?mid=',
    userinfo2: 'https://api.bilibili.com/x/web-interface/card?mid=',
    videolist: 'https://space.bilibili.com/ajax/member/getSubmitVideos?mid=',
    videoBaseData : 'https://api.bilibili.com/x/web-interface/archive/stat?aid=',
    indexHtml: 'https://www.bilibili.com/video/av',
    danmuUrl: 'https://comment.bilibili.com/',
    commentUrl: "https://api.bilibili.com/x/v2/reply?type=1&oid="

}


const biliall = {
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
                function(next){
                    let _url = `${_config_url.userinfo1}${userId}`
                    let _options = selectProxy(_url)
                    getData(_options, function (data) {
                        data = JSON.parse(data)
                        next('',data);
                    });
                },
                function(next){
                    let _url = `${_config_url.userinfo2}${userId}`
                    let _options = selectProxy(_url)
                    getData(_options, function (data) {
                        data = JSON.parse(data)
                        next('',data);
                    });
                },
            ], function(err, rst){
                // the results array will equal ['one','two'] even though
                // the second function had a shorter timeout.
                if(err) throw err; 
                _t.handle(rst,userId)
            })
            
        },
        handle(data, userId) {
            try{
                let _data = {
                    'platform' : 'bilibili',
                    'type': 'userBaseData',
                    'userId': `${userId}`,
                    'totalPlay': `${data[0].data.archive.view}`,
                    'follower': `${data[1].data.follower}` ,
                    'name': `${data[1].data.card.name}`
                }
                sendData(_data)
            }catch(e){}
        }
    },
    getUserVideo:{
        init(){
            let _t = this;
            for (let userId of userArr) {
                _t.getDataFun(userId,1)
            }
        },
        getDataFun(userId,page){
            let _url = `${_config_url.videolist}${userId}&pagesize=100&page=${page}`
            let _options = selectProxy(_url)
            let _t = this
            getData(_options, function (data) {
                data = JSON.parse(data)
                _t.handle(userId,data,page)
            });
        },
        handle(userId,ret,page){
            let videoIdArr = []
                data = ret.data,
                date = new Date(getMonthTime('lastmonth')),
                time = Date.parse(date),
                newPage = true,
                totalPage = data.pages,
                _t = this,
                _this = biliall,
                _index = 1

            for(let item of data.vlist){
                let created = parseInt(item.created+'000')
                if(created > time){
                    videoIdArr.push(item.aid)
                    _index++
                }else{
                    newPage = false
                }
            }
            if(totalPage > page && newPage){
                page++
                _t.getDataFun(userId,page)
            }  

            _this.getVideoBaseData.init(videoIdArr,userId);
            _this.getDanmu.init(videoIdArr,userId);
            _this.getComment.init(videoIdArr,userId);
        }
    },
    getVideoBaseData:{
        init(videoIdArr,userId){
            let _t = this;
            for (let avId of videoIdArr) {
                let _url = `${_config_url.videoBaseData}${avId}`
                let _options = selectProxy(_url)
                let _t = this
                getData(_options, function (data) {
                    data = JSON.parse(data)
                    _t.handle(avId,userId,data)
                });
            }
        },
        handle(avId,userId,pdata){
            let _data = {
                'platform' : 'bilibili',
                'type': 'videoBaseData',
                'userId': `${userId}`,
                'videoId' : `${avId}`,
                'coin' : `${pdata.data.coin}`,
                'share' : `${pdata.data.share}`,
                'favorite' : `${pdata.data.favorite}`
            }
            sendData(_data)
        }
    },
    getDanmu:{
        init(videoIdArr,userId){
            let _t = this;
            for (let avId of videoIdArr) {
                _t.getHtml(avId,userId)
            }
        },
        getHtml(avId,userId){
            let _url = `${_config_url.indexHtml}${avId}`
            let _options = selectProxy(_url)
            let _t = this
            getData(_options, function (data) {
                _t.getDanmuData(avId,userId,data)
            });
           
        },
        getDanmuData(avId,userId,pdata){
            let str = pdata.replace(/\r\n/g,"")
            str = str.replace(/\n/g,"");
            str = str.replace(/\s/g,"");

            let cid = str.match(/&amp;cid=(\S*)&amp;page/)[0]
            cid = cid.match(/&amp;cid=(\S*)&amp;page/)[1]
                
            
            let _url = `${_config_url.danmuUrl}${cid}.xml`
            let _options = selectProxy(_url)
            let _t = this
            getData(_options, function (data) {
                const $ = cheerio.load(data)
                let danmuarr = []

               


                for(let i =$("d").length; i>=0 ; i--){
                    if($("d").eq(i).attr("p") == undefined){
                        continue
                    }
                    let arr = $("d").eq(i).attr("p").split(",")
                    danmuarr.push({'content':$("d").eq(i).text(),'sendId':arr[3]}   )
                }
                _t.handle(avId,userId,danmuarr)
            });
        },
        handle(avId,userId,danmuarr){
            let _data = {
                'platform' : 'bilibili',
                'type': 'danmu',
                'userId': `${userId}`,
                'videoId' : `${avId}`
            }

            let num = 10
            for(let row=0;row<  Math.ceil(danmuarr.length/num);row++){
                row+=1
                _data['content'] = danmuarr.slice((row-1)*num,num*row)
                sendData(_data)
            }
            
        }
    },
    getComment:{
        init(videoIdArr,userId){
            let _t = this;
            for (let avId of videoIdArr) {
                _t.getdata(avId,userId,1)
            }
        },
        getdata(avId,userId,page){
            let _url = `${_config_url.commentUrl}${avId}&pn=${page}`
            let _options = selectProxy(_url)
            let _t = this
            getData(_options, function (data) {
                data = JSON.parse(data)
                _t.handle(userId,data,page,avId)
            });
        },
        handle(userId,pdata,page,avId){
            let lengthRpy = pdata['data']['replies'].length,
                arr = [],
                _t = this,
                _Continue = true
            if (lengthRpy!=0){
                for(let i = 0 ; i<lengthRpy;i++){
                    let comMsg=pdata['data']['replies'][i]['content']['message']
                    let sendId=pdata['data']['replies'][i]['member']['mid'] 
                    arr.push({"content":comMsg,"sendId":sendId})
                    let leng=pdata['data']['replies'][i]['replies'].length
                    for(let j=0;j< leng;j++){
                        let comMsgRp=pdata['data']['replies'][i]['replies'][j]['content']['message']
                        let sendId=pdata['data']['replies'][i]['replies'][j]['member']['mid'] 
                        arr.push({"content":comMsgRp,"sendId":sendId})
                    }
                }
                
                page++
                _t.getdata(avId,userId,page)
                if(arr.length<=0){
                    return false
                }
                let _data = {
                    'platform' : 'bilibili',
                    'type': 'comment',
                    'userId': `${userId}`,
                    'videoId' : `${avId}`,
                    'content' : arr
                }
                sendData(_data)
                
            }            
            // console.log(lengthRpy)
        }
       
    }
}

module.exports = biliall