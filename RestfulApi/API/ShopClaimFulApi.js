'use strict';

console.log("load ShopClaimFulApi.js");
var events = require('events');
var util = require('util');
var logger = require('../../logger').logger();

var DbCacheManager = require("../../cache/DbCache.js");
var ShopCache = require("../../cache/shopCache.js");

function ShopClaimInstance(){
	logger.log("INFO","create ShopClaimFulApi");
	events.EventEmitter.call(this);
}

util.inherits(ShopClaimInstance, events.EventEmitter);

function __delete(req,rsp){

	let uid = req.body['uid'];
	let shop_id = req.body['shop_id'];

	//ShopCache.getInstance().removeClaimShop(uid);
	//PlayerManager.getInstance().removeClaimShop(shop_id);

	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end("");
	return true;

}

function __usage(method,rsp,error_msg){
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end("");
	return;
}




function __post(req,rsp){
	return;

}

function __patch(req,rsp){
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end("");
}

function __options(req,rsp){
	__usage('OPTIONS',rsp);
	return;
}

var __instance = new ShopClaimInstance();

__instance.on('DELETE',__delete);
//__instance.on('POST',__post);
__instance.on('PATCH',__patch);
//__instance.on('OPTIONS',__options);

exports.Instance = function(){
	if(__instance == null){
		logger.log("WARN","CategoryInstance is null");
	}
	return __instance;
}