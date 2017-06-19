'use strict';
var http = require('http');

function post(path, send_message, uid, callback) {
  let sendBuffer = JSON.stringify(send_message);
  var options = {
    host: '127.0.0.1',
    port: 9891,
    path: '/' + path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(sendBuffer),
      'uid': uid,
    }
  };

  var req = http.request(options, function(serverFeedback) {
    var body = "";
    serverFeedback.on('data', function(data) {
      body += data;
    });
    serverFeedback.on('end', function() {
      callback(0, body);
    });
  });

  req.write(sendBuffer);
  req.end();
}

let test_route = {};
test_route['off_shelve_shop_item'] = off_shelve_shop_item;
test_route['close_shop'] = close_shop;
test_route['remove_shop_item'] = remove_item;
test_route['add_fav'] = add_fav_item;
test_route['rm_fav'] = remove_fav_item;

function off_shelve_shop_item() {
  let data = {
    'item_0': 2,
  };
  post('off_shelve_shop_item', data, 1, function(err, body) {
    console.log(body);
  });
}

function close_shop(param) {
  let data = {
    'close': 'true',
  };
  post('close_shop', data, param[0], (error, body) => {
    if (error) {
      console.log(error);
    } else {
      console.log(body);
    }
  });
}

function remove_item(param) {
  let data = {
    'item_id': param[1],
  }
  post('remove_shop_item', data, param[0], (error, body) => {
    if (error) {
      console.log(error);
    } else {
      console.log(body);
    }
  });
}

function handle_result(error, body) {
  if (error) {
    console.log(error);
  } else {
    console.log(body);
  }
}

function add_fav_item(param) {
  let data = {
    'item_id' : param[1],
  }
  post('add_favorites', data, param[0], handle_result);
}

function remove_fav_item(param){
  let data = {
    'item_id' : param[1],
  }
  post('remove_favorites_item', data, param[0], handle_result);
}

function test(cmd) {
  //console.log(cmd);
  if (cmd[0] in test_route) {
    test_route[cmd[0]](cmd.splice(1));
  } else {
    console.log(test_route);
  }
}
let args = process.argv;
if (args instanceof Array) {
  if (args.length > 2) {
    let cmd = args.splice(2);
    test(cmd)

  } else {
    console.log("参数长度过小");
  }
} else {
  console.log("参数不是数组");
}