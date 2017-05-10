'use strict';
var http = require('http');
function post(path,send_message,callback){
  let sendBuffer = JSON.stringify(send_message);
  var options = {
    host:'192.168.0.120',
    port: 9891,
    path: '/' + path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(sendBuffer),
      'uid' : 1,
    }
  };

  var req = http.request(options,function(serverFeedback){
    var body = "";  
    serverFeedback.on('data',function(data){
      body += data;
    });
    serverFeedback.on('end',function(){
      callback(0,body);
    });
  });
  
  req.write(sendBuffer);
  req.end();
}

let test_route = {};
test_route['off_shelve_shop_item'] = off_shelve_shop_item;

function off_shelve_shop_item(){
  let data = {
    'item_0' : 2,
  };
  post('off_shelve_shop_item',data,function(err,body){
    console.log(body);
  });
}

function test(cmd){
  //console.log(cmd);
  if(cmd[0] in test_route){
    test_route[cmd[0]](cmd.splice(1));
  }else{
    console.log(test_route);
  }
}
let args =  process.argv;
if(args instanceof Array){
  if(args.length > 2){
    let cmd = args.splice(2);
    test(cmd)
    
  }else{
    console.log("参数长度过小");
  }
}else{
  console.log("参数不是数组");
}