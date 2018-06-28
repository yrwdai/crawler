const getUrlhttp = require('./getUrlhttp');
const getUrlhttps = require('./getUrlhttps');
const zlib = require('zlib');


function getData(options, cb) {

    let _get = '',
        timeout = 10000
    if (options.path != undefined) {
        options.path.indexOf("https") >= 0 ? _get = getUrlhttps : _get = getUrlhttp;
    } else {
        options.indexOf("https") >= 0 ? _get = getUrlhttps : _get = getUrlhttp;
    }
    if (global.proxyIp != undefined) {
        _get = getUrlhttp;
    }

    let timeoutEventId = ''
    let req = _get(options, function (res) {
        let bufferHelper = new BufferHelper();   
        let contentEncoding = res.headers["content-encoding"];     
        res.on('data', function (chunk) {
            // dd = '' + chunk
            // console.log(chunk)
            bufferHelper.concat(chunk);
        });
        res.on('end',function(data){
            clearTimeout(timeoutEventId);
            let html = bufferHelper.toBuffer().toString();
            if(res.statusCode != 200){
                setTimeout(() => {
                    getIp()
                    console.log(JSON.stringify(options).red ,"重连".yellow)
                    setTimeout(() => {
                        if (global.proxyIp != undefined) {
                            options.host = global.proxyIp[0].ip;
                            options.port = global.proxyIp[0].port;
                        }
                        new getData(options, cb)
                    }, 2000)
                }, 5000)
                return false;
            }
            if (contentEncoding === "gzip") {
                html = zlib.gunzipSync(bufferHelper.toBuffer());
                cb(html.toString())
            }else if (contentEncoding == "deflate") {
                html = zlib.inflateRawSync(bufferHelper.toBuffer());
                cb(html.toString())
            }else{
                cb(html)
            }
           
            
            // console.log('response end...');
        });
    })
    
    timeoutEventId=setTimeout(function(){
        req.emit('timeout',{message:'have been timeout...'});
    },timeout);

    // console.log(timeoutEventId)
    req.on('error', function (e) {
        console.log('error got :'.red + JSON.stringify(options) + e.message);
        options.time += 1
        if (options.time < 3) {
            setTimeout(() => {
                getIp()
                console.log(JSON.stringify(options).red ,"重连".yellow)
                setTimeout(() => {
                    if (global.proxyIp != undefined) {
                        options.host = global.proxyIp[0].ip;
                        options.port = global.proxyIp[0].port;
                    }
                    new getData(options, cb)
                }, 2000)
            }, 5000)
        }
    }).on('timeout', function (e) {
        console.log('timeout got :'.yellow + e.message);
        options.time += 1
        if (options.time < 3) {
            setTimeout(() => {
                getIp()
                console.log(JSON.stringify(options).red ,"重连".yellow)
                setTimeout(() => {
                    if (global.proxyIp != undefined) {
                        options.host = global.proxyIp[0].ip;
                        options.port = global.proxyIp[0].port;
                    }
                    new getData(options, cb)
                }, 2000)
            }, 5000)
        }
    });

    req.on('timeout',function(e){
        // console.log(req.res)
        if(req.res){
            req.abort();
        }
        req.abort();
    });
    

    req.end();
}

module.exports = getData