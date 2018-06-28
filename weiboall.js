const Options = require('./util/options');

const userArr = [
    // '1192329374'
    '1772608152'
    // ,'1192329374','1732927460'
]



const _url = {
    userInfo: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=',
    weiboInfo: 'https://m.weibo.cn/api/container/getIndex?type=uid&value=',
    getComment: 'https://m.weibo.cn/api/comments/show?id='
}


const weiboday = {
    init() {
        console.log("weiboday---start")
        let _t = this;
        for (const item of userArr) {
            
            let _options = selectProxy(`${_url.userInfo}${item}`)
            getData(_options,function(data){
                _t.userInfo(data)
            });
        }
    },
    userInfo(pdata){
        // console.log(data)
        let ret = JSON.parse(pdata).data,
            _t = this
        let data = {
            'platform' : 'weibo',
            'type': 'userInfo',
            'userId': ret.userInfo.id,
            'userName': ret.userInfo.screen_name,
            'fans' : ret.userInfo.followers_count,
            'followCount' : ret.userInfo.follow_count
        }
        // console.log(_data)
        _t.sendData(data)

        _t.getUserWeiboInfo.init(ret,1)
    },
    getUserWeiboInfo:{
        init(pdata,page){
            // console.log(pdata.userInfo.id)
            let userId = pdata.userInfo.id,
                containerId = pdata.tabsInfo.tabs[1].containerid,
                _t = this
            let url = `${_url.weiboInfo}${userId}&containerid=${containerId}&page=${page}`
            let _options = selectProxy(url)
            getData(_options,function(data){
                let ret = JSON.parse(data).data.cards
                _t.handle(userId,ret,page,pdata)
            });
        },handle(userId,ret,page,pdata){
            let newarr = [],
                _t = this,
                _Continue = true
            let date = new Date(getMonthTime('lastmonth')),
                time = Date.parse(date)
            for(let item of ret){
                if(item.mblog != undefined){
                    let mblogId = item.mblog.id
                        cardsdata = {
                            'blogId': mblogId,
                            'repostsCount': item.mblog.reposts_count,
                            'commentsCount': item.mblog.comments_count,
                            'attitudesCount': item.mblog.attitudes_count,
                        }
                        weiboday.getComment.init(userId,mblogId,1)
                        newarr.push(cardsdata)
                }
            }
            
            if(newarr.length<=0){
                return false
            }
            let data = {
                'platform' : 'weibo',
                'type': 'blogInfo',
                'userId': `${userId}`,
                'info': newarr
            }
            weiboday.sendData(data)
            if(_Continue && ret.length >0 ){
                page++
                _t.init(pdata,page)
            }
        }   
    },
    sendData(data){
        data['platform'] = 'weibo'
        sendData(data)
    },
    getComment:{
        init(userId,mblogId,page){
            let url = `${_url.getComment}${mblogId}&page=${page}`,
                _options = selectProxy(url),
                _t = this
            getData(_options,function(pdata){
                let ret = JSON.parse(pdata)
                if( ret.data != undefined && ret.data.data != undefined ){
                    commentData = ret.data.data
                    if( commentData.length>0 ){
                        _t.handle(userId,mblogId,commentData,page)
                    }
                }
                
                
            });
        },
        handle(userId,mblogId,commentData,page){
            let commentArr = [],
                _t = this
            for(item of commentData){
                let _data = {
                    'commentId': `${item.id}`,
                    'commentUserId': `${item.user.id}`,
                    'commentUserName': `${item.user.screen_name}`,
                    'commentText': `${item.text}`,
                    'likeCounts': `${item.like_counts}`
                }
                commentArr.push(_data)
            }
            let data = {
                'platform' : 'weibo',
                'type': 'comments',
                'blogId': `${mblogId}`,
                'userId': `${userId}`,
                'info': commentArr
            }
            if(commentArr.length>0){
                weiboday.sendData(data)
            }
            if(commentData.length>0){
                page++
                _t.init(userId,mblogId,page)
            }
        }
    }
}

module.exports = weiboday





