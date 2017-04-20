'use strict';

console.log("load CustomServiceFulApi.js");
var events = require('events');
var util = require('util');
var logger = require('../../logger').logger();

var DbCacheManager = require("../../cache/DbCache.js");

function CustomServiceInstance(){
	//console.log('create CustomServiceInstance');
	events.EventEmitter.call(this);
}

util.inherits(CustomServiceInstance, events.EventEmitter);

function __delete(req,rsp){

	if(!('id' in req.body)){
		__usage("DELETE",rsp,"id is undefined");
		return;
	}
	let id = Number(req.body['id']);
	if(!('area_code' in req.body)){
		__usage("DELETE",rsp,"area_code is undefined");
		return;
	}
	let area_code = Number(req.body['area_code']);
	let result = DbCacheManager.getInstance().removeCustomService({
		'id' : id,
		'area_code' :  area_code,
	});

	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end(JSON.stringify({
		'error' : result['error'],
		'id' : id,
		'area_code' : area_code,
	}));

	return true;

}

function __usage(method,rsp,error_msg){
	
	let usage = {
		'error' : error_msg === undefined?0:1,
		'url':'http://ip:port/' + "/admin/v1/shop_cs",
		'method' : method,
		'Content-Type': 'application/json',
		'error_msg' : error_msg === undefined?"":error_msg
	};
	switch(method){
		case "DELETE":
			usage['body'] = {
				'id' : '[Number]',
				'area_code' : '[Number]',
			};
			break;
		case "PATCH":
		case "POST":
			usage['body'] = {
				'id' : '[Number]',
				'area_code' : '[Number]',
				'title' : '[STRING]',
			};
			break;
	}
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end(JSON.stringify(usage));
	return;
}




function __post(req,rsp){
	if(!('id' in req.body)){
		__usage("POST",rsp,"id is undefined");
		return;
	}
	let id = Number(req.body['id']);
	if(!('area_code' in req.body)){
		__usage("POST",rsp,"area_code is undefined");
		return;
	}
	let area_code = Number(req.body['area_code']);
	
	if(!('title' in  req.body)){
		__usage("POST",rsp,"title is undefined");
		return;
	}

	let title = req.body['title'];
	let result = DbCacheManager.getInstance().addCustomService({
		'id' : id,
		'area_code' : area_code,
		'title' : title,
	});

	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end(JSON.stringify({
		'error' : result['error'],
		'id' : id,
		'area_code' : area_code,
		'title' : title,
	}));
}
function __options(req,rsp){
	__usage('OPTIONS',rsp);
	return;
}

function __patch(req,rsp){
	if(!('id' in req.body)){
		__usage("PATCH",rsp,"id is undefined");
		return;
	}
	let id = Number(req.body['id']);
	if(!('area_code' in req.body)){
		__usage("PATCH",rsp,"area_code is undefined");
		return;
	}
	let area_code = Number(req.body['area_code']);
	
	if(!('title' in  req.body)){
		__usage("PATCH",rsp,"title is undefined");
		return;
	}

	let title = req.body['title'];
	let result = DbCacheManager.getInstance().updateCustomService({
		'id' : id,
		'area_code' : area_code,
		'title' : title,
	});

	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end(JSON.stringify({
		'error' : result['error'],
		'id' : id,
		'area_code' : area_code,
		'title' : title,
	}));
}

var __instance = new CustomServiceInstance();

__instance.on('DELETE',__delete);
__instance.on('POST',__post);
__instance.on('PATCH',__post);
__instance.on('OPTIONS',__options);
__instance.on('GET',__options);

exports.Instance = function(){
	return __instance;
}