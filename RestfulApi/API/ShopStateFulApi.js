'use strict';

console.log("load ShopStateFulApi.js");
var events = require('events');
var util = require('util');
var logger = require('../../logger').logger();
const Joi = require('joi');
var DbCacheManager = require("../../cache/DbCache.js");
var ShopCache = require("../../cache/shopCache.js")
var WebSocketServer = require('../../WebSocketServer');

const schema = Joi.object().keys({
    'shop_id': Joi.number().integer().min(1).required(),
    'state': Joi.number().integer().min(0).max(3).required(),
});

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
	rsp.end("");
	return;

}

function __patch(req,rsp){
	
	const result = Joi.validate(req.body, schema);
	let error = 0;
	let error_msg = "";
	if(result.error == null){
		let shop_id = Number(req.body['shop_id']);
		let state = Number(req.body['state']);
		ShopCache.getInstance().updateShopState(shop_id,state);
		let uid = ShopCache.getInstance().getOwner(shop_id);
		if(uid > 0){
			WebSocketServer.sendMessage(uid,'update_shop_state',{'state' : state});
		}
	}else{
		error_msg = result.error;
		error = 1;
	}
	let patch_result = {
		'error' : error,
		'error_msg' : error_msg,
	}
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end(JSON.stringify(patch_result));
	return
}

function __options(req,rsp){
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end("");
	return;
}

var __instance = new ShopStateFulApi();

//__instance.on('DELETE',__delete);
//__instance.on('POST',__post);
__instance.on('PATCH',__patch);
__instance.on('OPTIONS',__options);

exports.Instance = function(){
	if(__instance == null){
		logger.log("WARN","CategoryInstance is null");
	}
	return __instance;
}