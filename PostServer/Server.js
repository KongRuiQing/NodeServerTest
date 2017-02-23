var http = require('http');
var path=require('path');
var url=require('url');
const fs = require('fs');
var formidable = require('formidable');
var util = require('util');
var logger = require('../logger').logger();


var server = null;

var handle_http = require("./route.js");
var connect = require('connect');
var favicon = require('serve-favicon');
var responseTime = require('response-time')

var handle_login = require("./handle_login");

function printCostTime(req,rsp,time){

	logger.log("QUERY_SERVER","COST TIME: " + url.parse(req.url,true).pathname + " : " + time + "ms");
}

function handle_route(request,response,next){
	var pathname = url.parse(request.url).pathname;

	if(request.method.toLowerCase() === 'post'){
		var form = new formidable.IncomingForm();
		form.uploadDir = "assets/upload/";
		form.maxFields = 1000;
		form.maxFieldsSize = 2 * 1024 * 1024;
		form.keepExtensions = true;
		var headers = request.headers;
		form.parse(request, function(err, fields, files) {
			if(err){
				next(new Error(err));
				return;
			}
			try{
				if(pathname in handle_http){
					logger.log("POST_SERVER",util.inspect(headers,{depth:null}));
					handle_http[pathname](headers,fields,files,function(success,json_result){

						logger.log("POST_SERVER","response:\n" + util.inspect(json_result));

						response.writeHead(200, {'content-type': 'text/plain'});

						response.end(JSON.stringify(json_result));
					});
					return;
				}
				else{
					next(new Error(pathname + " no in handle_http"));
					return;
				}
			}catch(exc_err){
				next(new Error(exc_err));
				return;
			}
		});
	}else{
		next(new Error("Not post method"));
		return;
	}

	
}


var http_header = {};

http_header[200] = "text/html";
http_header[500] = 'text/plain';
http_header[600] = 'text/plain';
http_header[304] = 'text/plain';

function handle_Error(err, req, res, next){
	logger.error("POST_SERVER",err);
	res.writeHead(500, {
		'Content-Type': http_header[500]
	});
	res.end();
}

exports.start = function(Host,Port){
	var app = connect()
	.use(favicon("favicon.ico"))
	.use(responseTime(printCostTime))
	.use(handle_login)
	.use(handle_route)
	.use(handle_Error)
	app.listen(Port);
}

