'use strict';

console.log("load ShopStateFulApi.js");
var events = require('events');
var util = require('util');
var logger = require('../../logger').logger();

var DbCacheManager = require("../../cache/DbCache.js");
var ShopCache = require("../../cache/shopCache.js")
function ShopStateFulApi(){
	logger.log("INFO","create ShopStateFulApi");
	events.EventEmitter.call(this);
}

util.inherits(ShopStateFulApi, events.EventEmitter);

function __error(rsp,error){
	rsp.writeHead(error['error'], {'content-type': 'text/html'});
	rsp.end(JSON.stringify(json_result));
}

function __delete(req,rsp){

	rsp.writeHead(state_code, {'content-type': 'text/html'});
	rsp.end(JSON.stringify(json_result));
}

function __usage(method,rsp,error_msg){
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end("");
	return;
}


function __post(req,rsp){

	rsp.writeHead(state_code, {'content-type': 'text/html'});
	rsp.end(JSON.stringify(json_result));
	return;

}

function __patch(req,rsp){
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end("");
	return
}

function __options(req,rsp){
	__usage('OPTIONS',rsp);
	return;
}

var __instance = new ShopStateFulApi();

//__instance.on('DELETE',__delete);
__instance.on('POST',__post);
//__instance.on('PATCH',__patch);
//__instance.on('OPTIONS',__options);

exports.Instance = function(){
	if(__instance == null){
		logger.log("WARN","CategoryInstance is null");
	}
	return __instance;
}