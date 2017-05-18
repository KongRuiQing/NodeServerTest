'use strict';

var http = require('http');
var path=require('path');
var url=require('url');
const fs = require('fs');
var formidable = require('formidable');
var util = require('util');
var logger = require('../logger').logger();
var bodyParser = require('body-parser');
var AdInstance = require('./API/AdRestFulApi.js');
var CategoryInstance = require("./API/CategoryRestFulApi.js");
var ShopInstance = require("./API/ShopRestFulApi.js");
var ShopClaimInstance = require("./API/ShopClaimFulApi.js");
var CustomServiceInstance = require("./API/CustomServiceFulApi.js");
var ShopStateInstance = require("./API/ShopStateFulApi.js");
var WebSocketServer = require("./API/WebSocketServer.js");
var UserInstance = require('./API/UserInstance.js');
var server = null;

var connect = require('connect');
var favicon = require('serve-favicon');
var http_header = {};

http_header[200] = "text/html";
http_header[500] = 'text/plain';

var http_obj = {};

http_obj['/admin/v1/ad'] = AdInstance.Instance();
http_obj['/admin/v1/category'] = CategoryInstance.Instance();
http_obj['/admin/v1/shop'] = ShopInstance.Instance();
http_obj['/admin/v1/claim'] = ShopClaimInstance.Instance();
http_obj['/admin/v1/shop_cs'] = CustomServiceInstance.Instance();
http_obj['/admin/v1/shop_state'] = ShopStateInstance.Instance();
http_obj['/admin/v1/sendMessage'] = WebSocketServer.Instance();

http_obj['/admin/v1/user'] = UserInstance.Instance();

let PORT = 0;
function handle_route(request,response,next){
	var pathname = url.parse(request.url).pathname;
	var method = request.method.toUpperCase();
	logger.log("INFO",'pathname:',pathname," method:",method);
	if(pathname in http_obj){
		
		http_obj[pathname].emit(method,request,response);
		
	}else{
		logger.log("INFO",pathname," no find in http_obj");
		next(new Error(pathname + " no find in http_obj"));
	}
}

function handle_Error(err, req, res, next){
	logger.error("POST_SERVER",err);
	res.writeHead(200, {
		'Content-Type': http_header[200]
	});
	res.end(JSON.stringify({
		'error' : 'pathname is error',
	}));
}

function handle_head(req,rsp,next){
	rsp.setHeader("Access-Control-Allow-Origin", "*");
	rsp.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
	rsp.setHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,PATCH,OPTIONS");
	rsp.setHeader("Content-Type", "application/json;charset=utf-8");
	next()
}

exports.start = function(Host,Port){
	PORT = Port;
	var app = connect()
	.use(favicon("favicon.ico"))
	.use(bodyParser.json())
	.use(bodyParser.urlencoded({ extended: false }))
	.use(handle_head)
	.use(handle_route)
	.use(handle_Error)
	app.listen(Port);
}

