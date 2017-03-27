'use strict';

var http = require('http');
var path=require('path');
var url=require('url');
const fs = require('fs');
var formidable = require('formidable');
var util = require('util');
var logger = require('../logger').logger();
var bodyParser = require('body-parser');

var server = null;

var connect = require('connect');
var favicon = require('serve-favicon');
var http_header = {};

http_header[200] = "text/html";
http_header[500] = 'text/plain';

var http_obj = {};

http_obj['/admin/v1/ad'] = require('./API/AdRestFulApi.js').Instance();

let PORT = 0;
function handle_route(request,response,next){
	var pathname = url.parse(request.url).pathname;
	var method = request.method.toUpperCase();
	logger.log("INFO",pathname);
	if(pathname in http_obj){
		
		if(http_obj[pathname].emit(method,request,response)){
			return;
		}else{
			http_obj[pathname].emit('usage',method,response);
		}
	}else{
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

exports.start = function(Host,Port){
	PORT = Port;
	var app = connect()
	.use(favicon("favicon.ico"))
	//.use(bodyParser.urlencoded({ extended: false }))
	.use(bodyParser.json())
	.use(handle_route)
	.use(handle_Error)
	app.listen(Port);
}

