'use strict';

console.log("load MessageInstance.js");
var events = require('events');
var util = require('util');
var logger = require('../../logger').logger();

var DbCacheManager = require("../../cache/DbCache.js");
var ShopCache = require("../../cache/shopCache.js");
var MessageEventDispatcher = require("../../EventDispatcher/MessageEventDispatcher.js");
function MessageInstance(){
	logger.log("INFO","create MessageInstance");
	events.EventEmitter.call(this);
}

util.inherits(MessageInstance, events.EventEmitter);

function __error(rsp,error){
	rsp.writeHead(error['error'], {'content-type': 'text/html'});
	rsp.end(JSON.stringify(json_result));
}


function __usage(method,rsp,error_msg){
	rsp.writeHead(201, {'content-type': 'text/html'});
	rsp.end("");
	return;
}


function __post(req,rsp){
	MessageEventDispatcher.fireEvent("on_message_change");
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end(JSON.stringify({}));
	return;

}

function __options(req,rsp){
	__usage('OPTIONS',rsp);
	return;
}

var __instance = new MessageInstance();

//__instance.on('DELETE',__delete);
__instance.on('POST',__post);
//__instance.on('PATCH',__patch);
__instance.on('OPTIONS',__options);

exports.Instance = function(){
	if(__instance == null){
		logger.log("WARN","MessageInstance is null");
	}
	return __instance;
}