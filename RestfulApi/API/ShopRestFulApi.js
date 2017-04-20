'use strict';

console.log("load ShopRestFulApi.js");
var events = require('events');
var util = require('util');
var logger = require('../../logger').logger();

var DbCacheManager = require("../../cache/DbCache.js");
var ShopCache = require("../../cache/shopCache.js")
function ShopInstance(){
	logger.log("INFO","create CategoryInstance");
	events.EventEmitter.call(this);
}

util.inherits(ShopInstance, events.EventEmitter);

function __delete(req,rsp){

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

	let field_name = ['Id','uid','name','beg','end','days'
	,'longitude','latitude','city_no','area_code','address'
	,'category_code1','category_code2','category_code3'
	,'info'
	,'distribution'
	,'email','qq','wx'
	,'card_number'
	,'card_image'
	,'groupName1','groupName2','groupName3'
	,'fix_telephone','big_image'];

	
	let all_in_field = field_name.findIndex(function(item){
		return !(item in req.body);
	});
	let json_result = {};
	let state_code = 200;
	if(all_in_field >= 0){
		json_result['error'] = 1,
		state_code = 406;
	}else{
		let db_row = {
			'Id' : req.body['Id'],
			'uid' : req.body['uid'],
			'name' : req.body['name'],
			'beg' : Number(req.body['beg']),
			'end' : Number(req.body['end']),
			'days' : req.body['days'],
			'longitude' : parseFloat(req.body['longitude']),
			'latitude' : parseFloat(req.bode['latitude']),
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
			'state' : 2,
			'groupName1' : req.body['groupName1'],
			'groupName2' : req.body['groupName2'],
			'groupName3' : req.body['groupName3'],
			'fix_telephone' : req.body['fix_telephone'],
			'big_image' : req.body['big_image'],
		};

	}

	

	rsp.writeHead(state_code, {'content-type': 'text/html'});
	rsp.end(JSON.stringify(json_result));
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

var __instance = new ShopInstance();

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