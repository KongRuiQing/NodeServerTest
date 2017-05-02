'use strict';

console.log("load WebSocketServer.js");
var events = require('events');
var util = require('util');
var logger = require('../../logger').logger();
var WebSocketServer = require('../../WebSocketServer');
function WSInstance(){
	logger.log("INFO","create WSInstance");
	events.EventEmitter.call(this);
}

util.inherits(WSInstance, events.EventEmitter);

function __error(rsp,error){
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end("");
}

function __delete(req,rsp){

	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end("");
}

function __usage(method,rsp,error_msg){
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end("");
	return;
}


function __post(req,rsp){

	let fields = req.body;
	console.log('post');
	WebSocketServer.sendMessage(fields['guid'],fields['cmd'],fields['data']);
	let json_result = {
		'cmd' : fields['cmd'],
		'data' : fields['data'],
	}
	rsp.writeHead(200, {'content-type': 'text/html'});
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

var __instance = new WSInstance();

//__instance.on('DELETE',__delete);
__instance.on('POST',__post);
//__instance.on('PATCH',__patch);
//__instance.on('OPTIONS',__options);

exports.Instance = function(){
	if(__instance == null){
		logger.log("WARN","WSInstance is null");
	}
	return __instance;
}