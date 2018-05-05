
'use strict';

console.log("load CategoryRestFulApi.js");
var events = require('events');
var util = require('util');
var logger = require('../../logger').logger();
var WebSocketServer = require('../../WebSocketServer');
var DbCacheManager = require("../../cache/DbCache.js");
const Joi = require('joi');

function CategoryInstance(){
	logger.log("INFO","create CategoryInstance");
	events.EventEmitter.call(this);
}

util.inherits(CategoryInstance, events.EventEmitter);

function __delete(req,rsp){
	logger.log("CategoryRestfulapl delete req.body",req.body);
	const schema = Joi.object().keys({
		'id': Joi.number().integer().min(1).required(),
		'type': Joi.number().integer().min(1).max(2).required(),
	});
	const joi_result = Joi.validate(req.body, schema);
	if(joi_result.error != null){
		__usage("DELETT",rsp,joi_result.error);
		return ;
	}
	let error = 0;
	let error_msg = "";
	let code = Number(req.body['id']);
	let type = Number(req.body['type']);

	
	let result = DbCacheManager.getInstance().removeCategory({
		'code' : code,
		'type' : type,
	});
	WebSocketServer.broadcast('delete_category',{
		'code' : code,
		'type' : type
	});

	rsp.writeHead(200, {'content-type': 'text/html'});
	rsp.end(JSON.stringify({
		'error' : result['error'],
		'code' : code,
		'type' : type,
	}));

	return true;
}


function __usage(method,rsp,error_msg){
	rsp.writeHead(200, {'content-type': 'text/html'});
	let usage = {
		'error' : error_msg === undefined?0:1,
		'url':'http://ip:port/' + "/admin/v1/category",
		'method' : method,
		'Content-Type': 'application/json',
	};
	if(error_msg != undefined){
		usage['error_msg'] = error_msg;
	}
	if(method === 'POST'){
		usage['body'] = {
			'name' : '[String]',
			'code' : '[Number]',
			'type' : '[Number]',
			'parent' : '[Number]',
		};
	}else if(method === 'DELETT'){
		usage['body'] = {
			'type' : '[Number]',
			'code' : '[Number]',
		};
	}else if(method === 'PATCH'){
		usage['body'] = {
			'name' : '[String]',
			'code' : '[Number][...]',
			'type' : '[Number]',
			'parent' : '[Number]',
		};
	}

	rsp.end(JSON.stringify(usage));
	return;
}




function __post(req,rsp){

	console.log(req.body);
	const schema = Joi.object().keys({
		'code': Joi.number().integer().min(1).required(),
		'type': Joi.number().integer().min(1).max(2).required(),
		'name' : Joi.string().required(),
		'parent' : Joi.number().integer().min(1).required(),
	});

	const joi_result = Joi.validate(req.body, schema);
	if(joi_result.error != null){
		logger.log('INFO','joi_result:',joi_result.error);
		__usage('POST',rsp,joi_result.error);
		return;
	}
	
	
	let type = Number(req.body['type']);
	let code = Number(req.body['code']);
	let name = req.body['name'];
	let parent = Number(req.body['parent']);
	
	let result = DbCacheManager.getInstance().addCategory({
		'type' : type,
		'code' : code,
		'name' : name,
		'parent' : parent,
	});

	WebSocketServer.broadcast('add_category',{
		'type' : type,
		'code' : code,
		'name' : name,
		'parent' : parent,
	});

	let error = 0;
	if('error' in result){
		error = Number(result['error']);
	}
	if(error == 0){
		rsp.writeHead(200, {'content-type': 'text/html'});
		rsp.end(JSON.stringify({
			'error' : 0,
			'type' : type,
			'code' : code,
			'name' : name,
			'parent' : parent,
		}));
	}else{
		__usage('POST',rsp,'error is '+ error);
	}

}

function __patch(req,rsp){
	if(!('type' in req.body)){
		//logger.log("INFO",'position req:',util.inspect(req,{depth:null}));
		logger.log("WARN","req.body(type):",util.inspect(req.body));
		__usage('PATCH',rsp,"type is undefined");
		return;
	}
	if(!('code' in req.body)){
		//logger.log("INFO",'index req:',util.inspect(req,{depth:null}));
		logger.log("WARN","req.body(code):",util.inspect(req.body));
		__usage('PATCH',rsp,"code in undefined");
		return;
	}
	if(!('name' in req.body)){
		//logger.log("INFO",'image req:',util.inspect(req,{depth:null}));
		logger.log("WARN","req.body(name):",util.inspect(req.body));
		__usage('PATCH',rsp,'name is undefined');
		return;
	}
	if(!('parent' in req.body)){
		//logger.log("INFO",'image req:',util.inspect(req,{depth:null}));
		logger.log("WARN","req.body(parent):",util.inspect(req.body));
		__usage('PATCH',rsp,'parent is undefined');
		return;
	}
	logger.log("INFO",'[CategoryRestFulApi][__patch]',
		'req.body:',util.inspect(req.body));
	
	let type = Number(req.body['type']);
	let code = Number(req.body['code']);
	let name = req.body['name'];
	let parent = Number(req.body['parent']);
	
	let result = DbCacheManager.getInstance().updateCategory({
		'type' : type,
		'code' : code,
		'name' : name,
		'parent' : parent,
	});

	let error = 0;
	if('error' in result){
		error = Number(result['error']);
	}
	if(error == 0){
		rsp.writeHead(200, {'content-type': 'text/html'});
		rsp.end(JSON.stringify({
			'error' : 0,
			'type' : type,
			'code' : code,
			'name' : name,
			'parent' : parent,
		}));
	}else{
		__usage('PATCH',rsp,'error is '+ error);
	}
}

function __options(req,rsp){
	__usage('OPTIONS',rsp);
	return;
}

var __instance = new CategoryInstance();

__instance.on('DELETE',__delete);
__instance.on('POST',__post);
__instance.on('PATCH',__patch);
__instance.on('OPTIONS',__options);

exports.Instance = function(){
	if(__instance == null){
		logger.log("WARN","CategoryInstance is null");
	}
	return __instance;
}