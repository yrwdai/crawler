function proxyIp(url){
    let _options = ''
    if(global.proxyIp == undefined){
        _options = `${url}`
    }else{
        _options = new Options()
        _options.path = `${url}`
    }
    return _options
}

module.exports = proxyIp