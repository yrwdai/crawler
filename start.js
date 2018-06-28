const getIp = require('./util/getProxyIp');
const getData = require('./util/getData');
const colors = require( "colors");
const BufferHelper = require('bufferhelper');
const selectProxy = require('./component/selectProxy');
const sendData = require('./component/sendDatas');
const getMonthTime = require('./component/getMonthTime');
const request = require('request');





const weiboDay = require('./weiboday');
const douYin = require('./douyinday');
const huya = require('./huyaday');
const douyu = require('./douyuday');
const biliday = require('./biliday');



global.getData = getData
global.getIp = getIp
global.colors = colors
global.BufferHelper = BufferHelper
global.selectProxy = selectProxy
global.sendData = sendData
global.getMonthTime = getMonthTime
global.request = request


function logs(data){
    console.log(data)
}
global.logs = logs


function startFun(){
    
    let inrTimeNum = 1;
    const inrTime = setInterval(()=>{
        if(global.proxyIp != undefined){
            clearInterval(inrTime)


            //启动方法
            weiboDay.init();   
            douYin.init();     
            huya.init();
            douyu.init();
            biliday.init()

        }

        //三次失败后使用系统ip
        if(global.proxyIp == undefined && inrTimeNum == 3){
            
            //启动方法
            weiboDay.init();
            douYin.init();     
            huya.init();
            douyu.init();
            biliday.init()

        }
        if(inrTimeNum >=3){
            clearInterval(inrTime)
        }
        inrTimeNum++
    },2000)
    getIp()
}
setTimeout(()=>{
    startFun()
},10)

// console.log()
// sendData("test")