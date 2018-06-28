const roomidArr = [
    '871001',
    '912520',
    '131410',
    '7911',
    '325323',
    '199300',
    '14181326',
    '908400',
    '181800',
    '199300',
    '520520',
    '12648619',
    '103444', 
    '114421',
    '552332',
    '929211',
    '146688',
    '652323',
]


const _config_url = {
    room : 'https://www.huya.com/'
}


const huya = {
    init(){
        console.log("huya---start")
        let _t = this;
        for (const roomId of roomidArr) {
            let _url = `${_config_url.room}${roomId}`
            let _options = selectProxy(_url)

            getData(_options,function(data){
                str = data.replace(/\r\n/g,"")
                str = str.replace(/\n/g,"");
                str = str.replace(/\s/g,"");
                _t.handle(str,roomId)
            });
        }
    },
    handle(str,roomId){
        let nicknime = str.match(/<h3class="host-name"(\S*)<spanclass="open-souhuclickstat"/)[1],
            nicknime_str = nicknime.match(/title="(\S*)">/)[1],
            fans = str.match(/<divclass="subscribe-count"id="activityCount">(\S*)<\/div><divclass="entrance-expandsubscribe-expand"/)[1]
        // console.log(nicknime_str)
        let _data = {
            'platform' : 'huya',
            'type': 'userinfo',
            'roomid': `${roomId}`,
            'userName': `${nicknime_str}`,
            'fans': `${fans}`
        }
        sendData(_data)
    }
}

module.exports = huya