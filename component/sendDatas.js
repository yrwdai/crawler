function base64Fun(data) {
    data['platform'] = 'douyu'
    let _data = JSON.stringify(data)
    // _data = _data.replace(/\r\n/g,"")
    // _data = _data.replace(/\n/g,"");
    // _data = _data.replace(/\s/g,"&nbsp;");
    let base64Str = new Buffer(_data).toString('base64')
    return base64Str
}

function sendData(data) {
    console.log(JSON.stringify(data))
    data = base64Fun(data)
    let _data =encodeURIComponent(data) ;
   
}
module.exports =  sendData