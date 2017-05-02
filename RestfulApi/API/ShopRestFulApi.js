'use strict';

console.log("load ShopRestFulApi.js");
var events = require('events');
var util = require('util');
var logger = require('../../logger').logger();

var DbCacheManager = require("../../cache/DbCache.js");
var shopCache = require("../../cache/shopCache.js");
const Joi = require('joi');
function ShopInstance(){
	logger.log("INFO","create CategoryInstance");
	events.EventEmitter.call(this);
}

util.inherits(ShopInstance, events.EventEmitter);

function __error(rsp,error){
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end(JSON.stringify(error));
}

function __delete(req,rsp){

	const schema = Joi.object().keys({
		'id': Joi.number().integer().min(1).required()
	});
	const joi_result = Joi.validate(req.body, schema);

	if(joi_result.error != null){
		logger.log("WARN",'req.body:',req.body);
		__error(rsp,joi_result.error);
		return;
	}
	
	let shop_id = Number.parseInt(req.body['id']);
	if(Number.isNaN(shop_id)){
		__error(rsp,{'error' : 406,'error_msg' : 'id参数只能是数字'});
		return;
	}

	shopCache.getInstance().removeShopByShopId(shop_id);
	
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end(JSON.stringify({'error' : 0}));
	return;

}

function __usage(method,rsp,error_msg){
	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end("");
	return;
}

function __vaild(req){
	const schema = Joi.object().keys({
		'id' : Joi.number().integer().min(1).required(),
		'name' : Joi.string().min(1).required(),
		'category_code1' : Joi.number().integer().min(0).required(),
		'category_code2' : Joi.number().integer().min(0).required(),
		'category_code3' : Joi.number().integer().min(0).required(),
		'city_no' : Joi.number().integer().min(1).required(),
		'area_code' : Joi.number().integer().min(1).required(),
		'days' : Joi.string().regex(/^[0-1]+$/).length(7).required(),
		'beg' : Joi.number().integer().min(0).max(86399).required(),
		'end' : Joi.number().integer().min(0).max(86399).required(),
		'telephone' : Joi.string().regex(/^[0-9]+$/).min(7).required(),
		'email' : Joi.string().required(),
		'qq' : Joi.string().required(),
		'wx' : Joi.string().required(),
		'longitude' : Joi.number().required(),
		'latitude' : Joi.number().required(),
		'card_number' : Joi.string().required(),
		'card_image' : Joi.string().required(),
		'qualification' : Joi.string().required(),
		'image' : Joi.string().required(),
		'address' : Joi.string().required(),
		'distribution' : Joi.string().required(),
		'info' : Joi.string().required(),

	});
	const joi_result = Joi.validate(req.body, schema);
	if(joi_result.error != null ){
		logger.log("WARN",'req.body:',req.body);
		
		return joi_result.error;
	}
	return null;
}

function __format(req){
	let data = {
		'Id' : Number(req.body['id']),
		'name' : req.body['name'],
		'beg' : Number(req.body['beg']),
		'end' : Number(req.body['end']),
		'days' : req.body['days'],
		'longitude' : parseFloat(req.body['longitude']),
		'latitude' : parseFloat(req.body['latitude']),
		'city_no' : Number(req.body['city_no']),
		'area_code' : Number(req.body['area_code']),
		'address' : req.body['address'],
		'category_code1' : Number(req.body['category_code1']),
		'category_code2' : Number(req.body['category_code2']),
		'category_code3' : Number(req.body['category_code3']),
		'info' : req.body['info'],
		'distribution' : req.body['distribution'],
		'telephone' : req.body['telephone'],
		'email' : req.body['email'],
		'qq' : req.body['qq'],
		'wx' : req.body['wx'],
		'image' : req.body['image'],
		'card_number' : req.body['card_number'],
		'card_image' : req.body['card_image'],
		'qualification' : req.body['qualification'],
	};
	return data;
}

function __post(req,rsp){

	
	let vaild_result = __vaild(req);
	if(vaild_result != null){
		__error(rsp,vaild_result);
		return;
	}

	let data = __format(req);
	data['state'] = 3;
	let state_code = 200;

	let json_result = shopCache.getInstance().addShopByApi(data);

	

	rsp.writeHead(state_code, {'content-type': 'text/html'});
	rsp.end(JSON.stringify(json_result));
	return;

}

function __patch(req,rsp){

	let vaild_result = __vaild(req);
	if(vaild_result != null){
		__error(rsp,vaild_result);
		return;
	}

	let data = __format(req);
	
	
	let state_code = 200;
	
	

	let json_result = shopCache.getInstance().updateShopByApi(data);

	

	rsp.writeHead(state_code, {'content-type': 'text/html'});
	rsp.end(JSON.stringify(json_result));
	return;
}

function __options(req,rsp){
	__usage('OPTIONS',rsp);
	return;
}

var __instance = new ShopInstance();

__instance.on('DELETE',__delete);
__instance.on('POST',__post);
__instance.on('PATCH',__patch);
//__instance.on('OPTIONS',__options);

exports.Instance = function(){
	if(__instance == null){
		logger.log("WARN","ShopInstance is null");
	}
	return __instance;
}