'use strict';
var http = require('http'); 
var FindUtil = require("./FindUtil.js");
//console.log(FindUtil.getFlatternDistance(0,0,0,0));
let args =  process.argv;

let test_route = {};
test_route['shop_list'] = test_shop_list;
test_route['shop_state'] = test_pathc_shop_state;
test_route['shop_detail'] = test_shop_detail;
test_route['shop_delete'] = test_shop_delete;
test_route['patch_shop'] = patch_shop;
test_route['add_shop'] = add_shop;
test_route['spread'] = get_spread;
test_route['websocket'] = test_websocket;
test_route['delete_category'] = delete_category;
test_route['add_category'] = add_category;

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

function test(cmd){
  //console.log(cmd);
  if(cmd[0] in test_route){
    test_route[cmd[0]](cmd.splice(1));
  }else{
    console.log(test_route);
  }
}

function post(send_message,path,callback){
  var options = {
    host:'192.168.0.120',
    port: 12000,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
  console.log(JSON.stringify(send_message));
  req.write(JSON.stringify(send_message));
  req.end();
}

function patch(send_message,path,callback){
  var options = {
    host:'localhost',
    port: 12000,
    path: path,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      
    }
  };

  var req = http.request(options,function(serverFeedback){
    if(serverFeedback.statusCode ==200){
      var body = "";  
      serverFeedback.on('data',function(data){
        body += data;
      });
      serverFeedback.on('end',function(){
        callback(0,body);
      });
    }

  });
  req.write(JSON.stringify(send_message));
  req.end();
}

function __delete(send_message,path,callback){
  let sendBuffer = JSON.stringify(send_message);
  var options = {
    host:'localhost',
    port: 12000,
    path: path,
    method: 'delete',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(sendBuffer)
    }
  };

  var req = http.request(options,function(serverFeedback){
    if(serverFeedback.statusCode ==200){
      var body = "";  
      serverFeedback.on('data',function(data){
        body += data;
      });
      serverFeedback.on('end',function(){
        callback(null,body);
      });
    }else{
      callback(`state_code : {serverFeedback.statusCode}`);
    }

  });
  req.write(sendBuffer);
  req.end();
}

function get(path){
  http.get('http://127.0.0.1:9889/'+path,function(res){
    const statusCode = res.statusCode;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
      error = new Error(`Request Failed.\n` +
        `Status Code: ${statusCode}`);
    } else if (!/^text\/html/.test(contentType)) {
      error = new Error(`Invalid content-type.\n` +
        `Expected application/json but received ${contentType}`);
    }
    if (error) {
      console.log(error.message);
    // consume response data to free up memory
    res.resume();
    return;
  }

  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => rawData += chunk);
  res.on('end', () => {
    try {
      let parsedData = JSON.parse(rawData);
      console.log(parsedData);
    } catch (e) {
      console.log(e.message);
    }
  });
}).on('error',function(e){
  console.log(e);
});
}

function test_pathc_shop_state(args){
  console.log(args);
  let data = {
    'shop_id' : Number(args[0]),
    'state' : Number(args[1]),
  }
  patch(data,'/admin/v1/shop_state',function(error,body){
    console.log(body);
  });
}

function get_spread(args){
  get('shop_spread');
}

function patch_shop(args){
    
    let data = {
      'id' : args[0],
      'name' : args[1],
      'beg' : 1,
      'end' : 2,
      'days' : "1100011",
      'longitude' : 1.0,
      'latitude' : 2.3,
      'city_no' : 167,
      'area_code' : 111,
      'address' : "dd",
      'category_code1' : 1,
      'category_code2' : 2,
      'category_code3' : 3,
      'info' : "11111",
      'distribution' : "222",
      'telephone' : "123456789",
      'email' : "abc@123",
      'qq' : "qq",
      'wx' : "wx",
      'image' : "image",
      'card_number' : "123",
      'card_image' : "card_image",
      'qualification' : 'qualification',
    }
    patch(data,'/admin/v1/shop',function(error,body){
      if(error){
        console.log(error);
      }else{
        console.log(body);
      }
    });
  }

  function test_shop_list(args){
    let last_index = 0;

    get('shop_list?last_index=' + args[0]);
  }

  function test_shop_detail(args){
    let shop_id = args[0];
    get('shop_detail?shop_id=' + shop_id);
  }

  function test_shop_delete(args){
    let shop_id = args[0];
    let data = {
      'id' : shop_id,
    };

    __delete(data,'/admin/v1/shop',function(error,body){
      if(error == null){
        console.log(body);
      }else{
        console.log(222);
      }
    });
  }

  function add_shop(args){
    let data = {
      'id' : Number(args[0]),
      'name' : "name",
      'beg' : 1,
      'end' : 2,
      'days' : "1100011",
      'longitude' : 1.0,
      'latitude' : 2.3,
      'city_no' : 167,
      'area_code' : 111,
      'address' : "dd",
      'category_code1' : 1,
      'category_code2' : 2,
      'category_code3' : 3,
      'info' : "11111",
      'distribution' : "222",
      'telephone' : "123456789",
      'email' : "abc@123",
      'qq' : "qq",
      'wx' : "wx",
      'image' : "image",
      'card_number' : "123",
      'card_image' : "card_image",
      'qualification' : 'qualification',
    }
    post(data,'/admin/v1/shop',function(error,body){
      if(error){
        console.log(error);
      }else{
        console.log(body);
      }
    });
  }
function test_websocket(args){
  let data = {
    'guid' : args[0],
    'cmd' : 'login',
    'data' : {
      'guid' : args[0]
    }
  };
  console.log('test_websocket');
  post(data,'/admin/v1/sendMessage',function(error,body){
    if(error){
      console.log(error);
    }else{
      console.log(body);
    }
  });
}

function delete_category(args){
  let data = {
    'code' : args[0],
    'type' : args[1],
  }
  __delete(data,'/admin/v1/category',function(error,body){
    if(error){
        console.log(error);
    }else{
      console.log(body);
    }
  })
}

function add_category(args){
  let data = {
    'type' : 2,
    'code' : args[0],
    'name' : '测试',
    'parent' : 30
  };
  post(data,'/admin/v1/category',function(error,body){
    if(error){
      console.log(error);
    }else{
      console.log(body);
    }
  });
}

