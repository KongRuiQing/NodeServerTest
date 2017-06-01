'use strict';

console.log("load ShopStateFulApi.js");
var events = require('events');
var util = require('util');
var logger = require('../../logger').logger();
const Joi = require('joi');
var DbCacheManager = require("../../cache/DbCache.js");
var ShopCache = require("../../cache/shopCache.js")
var WebSocketServer = require('../../WebSocketServer');
let Tag = "[ShopStateFulApi]";
var ShopService = require("../../Logic/shop.js");
var ShopState = require("../../enum/shopState.js");
var OnlineService = require("../../Logic/online.js");

let TAG = "[ShopStateFulApi]";

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
	logger.log("INFO",TAG,"__patch",'req.body:',req.body);
	const result = Joi.validate(req.body, schema);
	
	let error_msg = "";
	let response_state = 200;
	if(result.error == null){
		let shop_id = Number(req.body['shop_id']);
		let state = Number(req.body['state']);
		logger.log("INFO",TAG,'__patch','param:',`shop_id:${shop_id} state:${state}`);

		let to_state = ShopState.parse(state);
		if(to_state < 0){
			logger.log("ERROR",TAG,'__patch',`state ${state} is error`);
			response_state = 201;
		}
		let from_state = ShopService.getShopState(shop_id);
		if(from_state == to_state){
			logger.log("ERROR",TAG,'__patch',`from_state(${from_state}) == to_state(${to_state})`);
			response_state = 202;
		}


		if(response_state == 200){
			//ShopCache.getInstance().updateShopState(shop_id,state);
			let uid = ShopService.changeShopState(shop_id,state);

			if(uid > 0){
				OnlineService.sendMessage(uid,'update_shop_state',{'state' : state});
			}
		}
	}else{
		response_state = 400;
		logger.log("ERROR",Tag,'__patch','joi_error:',result.error);
		error_msg = result.error;
		
	}
	let patch_result = {
		'error' : response_state == 200,
		'error_msg' : error_msg,
	}
	rsp.writeHead(response_state, {'content-type': 'text/html'});
	rsp.end(JSON.stringify(patch_result));
	return
}

function __options(req,rsp){
	//logger.log("INFO",Tag,'__options',req.body);
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
		logger.log("WARN","ShopStateFulApi is null");
	}
	return __instance;
}