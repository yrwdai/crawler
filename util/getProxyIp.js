let _options = 'http://api.xdaili.cn/xdaili-api//greatRecharge/getGreatIp?spiderId=51190d609b544415914960fc53113ced&orderno=YZ20186239493BAcebe&returnType=2&count=1'
let lock = false
function getIp() {
    if(lock){
        return false
    }
    lock = true
    setTimeout(()=>{
        lock = false
    },3000)
    getData(_options,callback)
    console.log('getProxyIp----start')
    function callback(data){
        console.log(data)
        data = JSON.parse(data)
        if(data.ERRORCODE == 0){
            global.proxyIp = data.RESULT
            console.log(global.proxyIp)
            return true
        }else{
            return false
        }
    }
}
module.exports = getIp