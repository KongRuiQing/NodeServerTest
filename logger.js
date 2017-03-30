var log4js = require('log4js');

Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

var log_name = new Date().Format('yyyyMMddhhmmss');
log_name = log_name + ".log";

log4js.configure({
  appenders: [
    { type: 'console'
    }, //控制台输出
    {
      type: 'file', //文件输出
      filename: 'logs/' + log_name, 
      maxLogSize: 1024,
      backups:3,
      category: 'normal' 
    }
  ],
  
});

var logger = null;
exports.logger = function(string){
  if(logger == null){
    logger = log4js.getLogger('normal');
    logger.setLevel('INFO');
  }
  
  return logger;
}