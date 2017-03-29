'use strict';

var events = require('events');
var util = require('util');
var logger = require('../../logger').logger();
var DbCacheManager = require("../../Cache/DbCache.js");

function AdInstance(){
	console.log('create AdInstance');
	events.EventEmitter.call(this);
}

util.inherits(AdInstance, events.EventEmitter);

function __delete(req,rsp){

	let position = Number(req.body['position']);
	let index = Number(req.body['index']);
	
	let result = DbCacheManager.getInstance().removeAd({
		'position' : position,
		'index' : index,
	});

	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end(JSON.stringify({
		'error' : result['error'],
		'position' : position,
		'index' : index,
	}));

	return true;

}

function __usage(method,rsp){
	rsp.writeHead(200, {'content-type': 'text/html'});
	let usage = {
		'error' : '1',
		'url':'http://ip:port/' + "/admin/v1/ad",
		'method' : method,
		'Content-Type': 'application/json',
	};
	if(method === 'POST'){
		usage['body'] = {
			'position' : '[Number]',
			'index' : '[Number]',
			'image' : '[String]',
			'url' : '[String]',
		};
	}else if(method === 'DELETT'){
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

	rsp.end(JSON.stringify(usage));
	return;
}




function __post(req,rsp,emit_result){

	if(!('position' in req.body)){
		//logger.log("INFO",'position req:',util.inspect(req,{depth:null}));
		logger.log("INFO","req.body(position):",util.inspect(req.body));
		emit_result = false;
		return;
	}
	if(!('index' in req.body)){
		//logger.log("INFO",'index req:',util.inspect(req,{depth:null}));
		logger.log("INFO","req.body(index):",util.inspect(req.body));
		emit_result = false;
		return;
	}
	if(!('image' in req.body)){
		//logger.log("INFO",'image req:',util.inspect(req,{depth:null}));
		logger.log("INFO","req.body(image):",util.inspect(req.body));
		emit_result = false;
		return;
	}
	if(!('url' in req.body)){
		//logger.log("INFO",'image req:',util.inspect(req,{depth:null}));
		logger.log("INFO","req.body(url):",util.inspect(req.body));
		emit_result = false;
		return;
	}
	logger.log("INFO","success parse");
	

	let position = Number(req.body['position']);
	let index = Number(req.body['index']);
	let image = req.body['image'];
	let url = req.body['url'];
	
	let result = DbCacheManager.getInstance().changeAd({
		'position' : position,
		'index' : index,
		'image' : image,
		'url' : url,
	},true);

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
		emit_result = true;
		return;
	}
	emit_result = false;
	return;
}
function __options(req,rsp,emit_result){
	emit_result = false;
	return;
}

var __instance = new AdInstance();

__instance.on('DELETT',__delete);
__instance.on('POST',__post);
__instance.on('PATCH',__post);
__instance.on('USAGE',__usage);
__instance.on('OPTIONS',__options);

exports.Instance = function(){
	return __instance;
}