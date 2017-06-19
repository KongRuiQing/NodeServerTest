var http = require('http');
var qs = require('querystring');

// 修改为您的短信账号
var un="xxxx";
// 修改为您的短信密码
var pw="xxx";
// 修改您要发送的手机号码，多个号码用逗号隔开

// 短信域名地址
var sms_host = 'sms.253.com';
// 发送短信地址
var send_sms_uri = '/msg/send';
// 查询余额地址
var query_balance_uri = '/msg/balance';

var config = require('config');

exports.send_sms = function(telephone,verify_code){
    var msg = config.get("Find.sms_text");
    var post_data = { // 这是需要提交的数据 
        'un': config.get("Find.sms_username"),   
        'pw': config.get("Find.sms_password"), 
        'phone':telephone,
        'msg':msg.replace(config.get("Find.sms_replace"),verify_code),
        'rd':'1',
    };  

    var content = qs.stringify(post_data);  

    post(send_sms_uri,content,sms_host);
}

// 查询余额方法
exports.query_blance = function(){
	
    var post_data = { // 这是需要提交的数据 
        'un': un,   
        'pw': pw, 
    };  
    var content = qs.stringify(post_data);  
    post(query_balance_uri,content,sms_host);
}

function post(uri,content,host){
	var options = {  
        hostname: host,
        port: 80,  
        path: uri,  
        method: 'POST',  
        headers: {  
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',  
            'Content-Length': content.length   
        }  
    };
    var req = http.request(options, function (res) {  
        //console.log('STATUS: ' + res.statusCode);  
        res.setEncoding('utf8');  
        res.on('data', function (chunk) { 
            console.log('Recv BODY: ' + chunk);  
        }); 
        res.on('end',function(){

        });
    }); 

    req.write(content);  

    req.end();   
} 


