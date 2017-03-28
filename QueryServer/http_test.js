'use strict';
var moment = require('moment');
var http = require('http'); 
var querystring = require('querystring');

function post(send_message,path,callback){
	var options = {

		host:'localhost',
		port: 12000,
		path: path,
		method: 'POST',
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

// http://127.0.0.1:9889/test/v1/ad?position=0&index=1 删除
// http://127.0.0.1:9889/test/v1/ad?&position=0&index=1&image=ad/2.png 修改
// http://127.0.0.1:9889/test/v1/ad?type=2&position=0&index=1&image=ad/1.png 添加
exports.testAddAdImage = function(headers, query,callback){
	let type = 0;
	
	let position = 0;
	if('position' in query){
		position = Number(query['position']);
	}
	let index = 0;
	if('index' in query){
		index = Number(query['index']);
	}
	let image = "\\ad\\3.jpg";
	if('image' in query){
		image = query['image'];
	}

	//var data = querystring.stringify();
	var data = {
		'position':position,
		'index':index,
		'image':image,
		'url':'http://www.baidu.com',
	}
	post(data,'/admin/v1/ad',callback);
}

exports.testShop = function(headers,query,callback){
	let type = Number(query['type']);
	var data = querystring.stringify({
		'type':type,
		"id" : 123,
		'name' : 'name' + type,
		'beg' :6*3600,
		'end' : 18*3600,
		'days' : 111111,
		'longitude' : 2506,
		'latitude'  : 1110,
		'city_no' : 167,
		'area_code' : 167001,
		'address' : '地址',
		'qualification' : 'shop/qualification/1.png',
		'category1' : 3,
		'category2' : 4,
		'category3' : 5,
		'info' : '商铺介绍',
		'distribution' : '配送地址',
		'telephone' : '12345678901',
		'email' : 'abc@123.com',
		'qq' : '123456',
		'wx' : '654321',
		'image' : 'shop/image/1.png',
		'card_image' : 'shop/card/1.png',
		'card_number' : '123456789012345678990',
		'state' : 1,
	});
	post(data,'/admin/v1/shop',callback);
}

exports.testShopItem = function(headers,query,callback){
	let type = Number(query['type']);
	let name = query['name'];
	var data = querystring.stringify({
		'type' : type,
		'id' : 123,
		'shop_id' : 4,
		'name' : name,
		'price' :100,
		'show_price' : 200,
		'is_show' : 1,
		'spread_image' : '',
		'show_images' : [''],
		'detail_images' : [''],
		'link_url' : '',

	});
	post(data,'/admin/v1/shop_item',callback);
}