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
		'url':'http://ip:port/' + "/admin/v1/ad",
		'method' : method,
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




function __post(req,rsp){

	let position = Number(req.body['position']);
	let index = Number(req.body['index']);
	let image = req.body['image'];
	let url = req.body['url'];
	logger.log("INFO",'position=',position);
	let result = DbCacheManager.getInstance().changeAd({
		'position' : position,
		'index' : index,
		'image' : image,
		'url' : url,
	},true);
	
	if('error' in result){
		if(result['error'] == 0){
			
			rsp.writeHead(200, {'content-type': 'text/html'});
			rsp.end(JSON.stringify({
				'error' : 0,
				'position' : position,
				'index' : index,
				'image' : image,
				'url' : url,
			}));

			return true;
		}else{
			return false;
		}
	}
	return false;
}	

var __instance = new AdInstance();

__instance.on('DELETT',__delete);
__instance.on('POST',__post);
__instance.on('PATCH',__post);
__instance.on('usage',__usage);
__instance.on('OPTIONS',__usage);

exports.Instance = function(){
	return __instance;
}