const userArr = [
    '61301795151', 
    '55984163441', 
    '75865339382'
]


const _config_url = {
    getToken: 'https://api.yrwdai.com/douyin?userId=',
    getUserVideo: 'https://www.douyin.com/aweme/v1/aweme/post/?user_id=',
    getUserInfo: 'https://www.douyin.com/share/user/'
}

function replaceNumFun(text){
    text = text.replace(/&#xe602;/g,"1")
    text = text.replace(/&#xe603;/g,"0")
    text = text.replace(/&#xe604;/g,"3")
    text = text.replace(/&#xe605;/g,"2")
    text = text.replace(/&#xe606;/g,"4")
    text = text.replace(/&#xe607;/g,"5")
    text = text.replace(/&#xe608;/g,"6")
    text = text.replace(/&#xe609;/g,"9")
    text = text.replace(/&#xe60a;/g,"7")
    text = text.replace(/&#xe60b;/g,"8")
    text = text.replace(/&#xe60c;/g,"4")
    text = text.replace(/&#xe60d;/g,"0")
    text = text.replace(/&#xe60e;/g,"1")
    text = text.replace(/&#xe60f;/g,"5")
    text = text.replace(/&#xe610;/g,"2")
    text = text.replace(/&#xe611;/g,"3")
    text = text.replace(/&#xe612;/g,"6")
    text = text.replace(/&#xe613;/g,"7")
    text = text.replace(/&#xe614;/g,"8")
    text = text.replace(/&#xe615;/g,"9")
    text = text.replace(/&#xe616;/g,"0")
    text = text.replace(/&#xe617;/g,"2")
    text = text.replace(/&#xe618;/g,"1")
    text = text.replace(/&#xe619;/g,"4")
    text = text.replace(/&#xe61a;/g,"3")
    text = text.replace(/&#xe61b;/g,"5")
    text = text.replace(/&#xe61c;/g,"7")
    text = text.replace(/&#xe61d;/g,"8")
    text = text.replace(/&#xe61e;/g,"9")
    text = text.replace(/&#xe61f;/g,"6")
    return text
}

function replaceStrFun(text){
    text = text.replace(/<spanclass="liked-numblock">/g,"")
    text = text.replace(/<spanclass="num">/g,"")
    text = text.replace(/<iclass="iconiconfontfollow-num">/g,"")
    text = text.replace(/<\/span>/g,"")
    text = text.replace(/<spanclass="followerblock">/g,"")
    text = text.replace(/<\/i>/g,"")
    text = text.replace(/<spanclass="focusblock">/g,"")
    text = text.replace(/<spanclass="text">赞/g,"")
    text = text.replace(/<spanclass="text">粉丝/g,"")
    text = text.replace(/<spanclass="text">关注/g,"")
    text = replaceNumFun(text)
    return text
}

const douyin = {
    init() {
        console.log("douyin---start")
        let _t = this;
        for (const userId of userArr) {
            _t.getUserInfo.init(userId)
            request({
                url:  `${_config_url.getToken}${userId}`,
                method: "get",
                json: true,
                headers: {
                    "content-type": "application/json",
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36'
                },
            }, function (error, response, body) {
                _t.getUserVideo.init(userId,body,0)
            });
        }
    },
    getUserVideo:{
        init(userId,token,max_cursor){
            let _t = this
            let _url = `${_config_url.getUserVideo}${userId}&count=21&max_cursor=${max_cursor}&aid=1128&_signature=${token}`
            let _options = selectProxy(_url)
            getData(_options,function(data){
                // _t.userInfo(data)
                // console.log(JSON.parse( data))
                let _data = JSON.parse( data)
                if(_data.has_more == 1){
                    _t.init(userId,token,_data.max_cursor)
                }
                _t.handle(_data,userId)
            });
        },
        handle(pdata,userId){
            for(let item of pdata.aweme_list){
                data = {
                    'platform' : 'douyin',
                    'type': 'video',
                    'userId': `${userId}`,
                    'title' : `${item.desc}`,
                    'videoId' : `${item.statistics.aweme_id}`,
                    'commentCount' : `${item.statistics.comment_count}`,
                    'diggCount' : `${item.statistics.digg_count}`,
                    'playCount' : `${item.statistics.play_count}`,
                    'shareCount' : `${item.statistics.share_count}`
                }
                sendData(data)
            }
        }   
    },
    getUserInfo:{
        init(userId){
            let _t = this
            let _url = 'https://www.douyin.com/share/user/' +userId+ '?share_type=link'
            let _options = selectProxy(_url)
            getData(_options,function(data){
                var str = data;
                str = str.replace(/\r\n/g,"")
                str = str.replace(/\n/g,"");
                str = str.replace(/\s/g,"");
                str = str.match(/<divclass="page-reflow-user">(\S*)<spanclass="txt">打开看看/)[0];
                _t.handle(str,userId)
            });
        },
        handle(str,userId){
            // console.log(str,userId)
            let nicknime = str.match(/<pclass="nickname">(\S*)<\/p><pclass="shortid">/)[1],
                liked = str.match(/<spanclass="liked-numblock">(\S*)<spanclass="text">赞/)[0],
                liked_num = replaceStrFun(liked),
                follower = str.match(/<spanclass="followerblock">(\S*)<spanclass="text">粉丝/)[0],
                follower_num  = replaceStrFun(follower),
                focus = str.match(/<spanclass="focusblock">(\S*)<spanclass="text">关注/)[0],
                focus_num  = replaceStrFun(focus)
                
            data = {
                'userId': `${userId}`,
                'nikename': `${nicknime}`,
                'type': 'userInfo',
                'liked': `${liked_num}`,
                'focus': `${focus_num}`,
                'follower': `${follower_num}`,
                'platform': 'douyin'
            }
            sendData(data)
        }
    }
}

module.exports = douyin