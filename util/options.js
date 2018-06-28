function Options() {
    
    let options = {
        host: global.proxyIp[0].ip,
        method: 'GET',
        port: global.proxyIp[0].port,
        path: "http://ip-api.com/json",
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
        },
        time: 0
    };
    return options
}
module.exports = Options