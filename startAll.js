const getIp = require('./util/getProxyIp');
const getData = require('./util/getData');
const colors = require( "colors");
const BufferHelper = require('bufferhelper');
const selectProxy = require('./component/selectProxy');
const sendData = require('./component/sendData');
const getMonthTime = require('./component/getMonthTime');




const weiboAll = require('./weiboall');
const biliall = require('./biliall');



global.getData = getData
global.getIp = getIp
global.colors = colors
global.BufferHelper = BufferHelper
global.selectProxy = selectProxy
global.sendData = sendData
global.getMonthTime = getMonthTime




function startFun(){
    let inrTimeNum = 1;
    const inrTime = setInterval(()=>{
        if(global.proxyIp != undefined){
            clearInterval(inrTime)


            //启动方法
            // weiboAll.init();
            biliall.init();


        }
        if(global.proxyIp == undefined && inrTimeNum == 3){
            //启动方法
            // weiboAll.init();
            biliall.init();


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
},2000)

// console.log()
// sendData("test")