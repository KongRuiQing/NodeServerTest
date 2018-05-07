'use strict';

console.log("load AdRestFulApi.js");
var events = require('events');
var util = require('util');
var logger = require('../../logger').logger();

var DbCacheManager = require("../../cache/DbCache.js");

function AdInstance(){
	console.log('create AdInstance');
	events.EventEmitter.call(this);
}

util.inherits(AdInstance, events.EventEmitter);

function __delete(req,rsp){

	let position = Number(req.body['position']);
	let index = Number(req.body["index"]);

	
	logger.log('INFO','[AdRestFulApi][__delete]',
		'req:',req.body);
	let result = DbCacheManager.getInstance().removeAd({
		'position' : position,
		'index' : index
	});

	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end(JSON.stringify({
		'error' : result['error'],
	}));

	return true;

}

function __usage(method,rsp,error_msg){
	rsp.writeHead(200, {'content-type': 'text/html'});
	let usage = {
		'error' : error_msg === undefined?0:1,
		'url':'http://ip:port/' + "/admin/v1/ad",
		'method' : method,
		'Content-Type': 'application/json',
	};
	if(error_msg != undefined){
		usage['error_msg'] = error_msg;
	}
	if(method === 'POST'){
		usage['body'] = {
			'position' : '[Number]',
			'index' : '[Number]',
			'image' : '[String]',
			'url' : '[String]',
		};
	}else if(method === 'DELETE'){
		usage['body'] = {
			'position' : '[Number]',
			'index' : '[Number]',
		};
	}else if(method === 'PATCH'){
		usage['body'] = {
			'position' : '[Number]',
			'index' : '[Number]',
			'image' : '[String]',
			'url' : '[String]',
		};
	}
	logger.log('WARN','[AdRestFulApi][__usage]',
		'result:',util.inspect(usage));

	rsp.end(JSON.stringify(usage));
	return;
}




function __post(req,rsp){

	logger.log("INFO"
		,'[DbCache][__post]'
		,"req.body:",util.inspect(req.body));

	if(!('position' in req.body)){
		//logger.log("INFO",'position req:',util.inspect(req,{depth:null}));
		
		__usage('POST',rsp,"position is undefined");
		return;
	}
	if(!('index' in req.body)){
		//logger.log("INFO",'index req:',util.inspect(req,{depth:null}));
		
		__usage('POST',rsp,"index in undefined");
		return;
	}
	if(!('image' in req.body)){
		//logger.log("INFO",'image req:',util.inspect(req,{depth:null}));
		
		__usage('POST',rsp,'image is undefined');
		return;
	}
	if(!('url' in req.body)){
		//logger.log("INFO",'image req:',util.inspect(req,{depth:null}));
		__usage('POST',rsp,'url is undefined');
		return;
	}
	
	let position = Number(req.body['position']);
	let index = Number(req.body['index']);
	let image = req.body['image'];
	let url = req.body['url'];
	let id = ('id' in req.body)?Number(req.body['id']):0;
	let result = DbCacheManager.getInstance().changeAd({
		'id' : id,
		'position' : position,
		'index' : index,
		'image' : image,
		'url' : url,
	});

	let error = 0;
	if('error' in result){
		error = Number(result['error']);
	}
	if(error == 0){
		rsp.writeHead(200, {'content-type': 'text/html'});
		rsp.end(JSON.stringify({
			'error' : 0,
			'position' : position,
			'index' : index,
			'image' : image,
			'url' : url,
		}));
	}else{
		__usage('POST',rsp,'error is '+ error);
	}

}
function __options(req,rsp){
	__usage('OPTIONS',rsp);
	return;
}

var __instance = new AdInstance();

__instance.on('DELETE',__delete);
__instance.on('POST',__post);
__instance.on('PATCH',__post);
__instance.on('OPTIONS',__options);
__instance.on('GET',__options);

exports.Instance = function(){
	return __instance;
}