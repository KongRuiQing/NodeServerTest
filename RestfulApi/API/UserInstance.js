'use strict';

console.log("load UserInstance.js");
var events = require('events');
var util = require('util');
var logger = require('../../logger').logger();
var ShopService = require("../../Logic/shop.js");
var DbCacheManager = require("../../cache/DbCache.js");
var ShopCache = require("../../cache/shopCache.js");
var PlayerCache = require("../../playerList.js");
var WebSocketServer = require('../../WebSocketServer');

var LoginModule = require("../../Logic/login.js");
var OnlineModule = require("../../Logic/online.js");
const Joi = require('joi');


function UserInstance(){
	logger.log("INFO","create UserInstance");
	events.EventEmitter.call(this);
}

util.inherits(UserInstance, events.EventEmitter);

function __error(rsp,error){
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end(JSON.stringify(error));
}

function __delete(req,rsp){
	let TAG = '[UserInstance][__delete]';
	const schema = Joi.object().keys({
		'id': Joi.string().required(),
	});
	const joi_result = Joi.validate(req.body, schema);
	let response_state = 200;
	let json_result = {};
	if(joi_result.error == null){
		let uid = Number(req.body['id']);
		logger.log("INFO",TAG,`uid ${uid} is removed`);
		let shop_id = ShopService.getOwnShopId(uid);
		if(shop_id > 0){
			ShopCache.getInstance().removeShopByShopId(shop_id);
		}
		PlayerCache.getInstance().removePlayer(uid);
		if(uid > 0){
			
			OnlineModule.kickoff(uid);
			LoginModule.removeUser(uid);
		}
	}else{
		response_state = 400;
		logger.log("ERROR","[UserInstance][__delete] joi error:",joi_result.error);
		json_result['error_msg'] = joi_result.error;
	}
	rsp.writeHead(response_state, {'content-type': 'text/html'});
	rsp.end(JSON.stringify(json_result));
}

function __usage(method,rsp,error_msg){
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end("");
	return;
}


function __post(req,rsp){

	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end("");
	return;

}

function __patch(req,rsp){
	logger.log("INFO","[UserInstance][__patch] req.body:",req.body);
	if('state' in req.body){
		let state = Number(req.body['state']);
		let uid = Number(req.body['id']);
		LoginModule.changeLoginState(uid,state);
		OnlineModule.notifyUserLoginStateChange(uid,state);
	}else{

	}
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end("");
	return
}

function __options(req,rsp){
	__usage('OPTIONS',rsp);
	return;
}

var __instance = new UserInstance();

__instance.on('DELETE',__delete);
//__instance.on('POST',__post);
__instance.on('PATCH',__patch);
__instance.on('OPTIONS',__options);

exports.Instance = function(){
	if(__instance == null){
		logger.log("WARN","UserInstance is null");
	}
	return __instance;
}