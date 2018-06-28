var http=require('http');
function requestWithTimeout(options,callback){
    var timeoutEventId,
        req=http.request(options,function(res){
            // res.on('end',function(data){
            //     clearTimeout(timeoutEventId);
            //     // console.log('response end...');
            // });
            
            res.on('close',function(){
                clearTimeout(timeoutEventId);
                // console.log('response close...');
            });
            
            res.on('abort',function(){
                console.log('abort...');
            });
            
            callback(res);
        });
        
    
    return req;
}

module.exports = requestWithTimeout




// var options = {
//   host: "111.231.115.150",
//   method: 'GET',
//   port: 8888,
//   path: "http://ip-api.com/json",
// };

// var req=requestWithTimeout('http://ip-api.com/json',10000,function(res){
//     res.on('data',function(chunk){
//         console.log(""+chunk);
//     });
// });
// req.on('error',function(e){
//     console.log('error got :' + e.message);
// }).on('timeout',function(e){
//     console.log('timeout got :'+ e.message);
// });
// req.end();


// function Get(options){
//     var req=requestWithTimeout(options,10000,function(res){
//         res.on('data',function(chunk){
//             console.log(''+chunk);
//         });
//     });
//     req.on('error',function(e){
//         console.log('error got :' + e.message);
//     }).on('timeout',function(e){
//         console.log('timeout got :'+ e.message);
//     });
//     req.end();
// }
// Get(options)


