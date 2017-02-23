'use strict';

var http = require('http');
var url=require('url');

var http_test = require("./http_test");
var logger = require('../logger').logger();
var server =null;
var util = require('util');
var connect = require('connect');
var favicon = require('serve-favicon');
var responseTime = require('response-time')
var route = require("./route.js");

var test_route = {};
test_route['/test/v1/ad'] = http_test.testAddAdImage;
test_route['/test/v1/Shop'] = http_test.testShop;
test_route['/test/v1/ShopItem'] = http_test.testShopItem;
var handle_login = require("./handle_login");

var http_header = {};

http_header[200] = "text/html";
http_header[500] = 'text/plain';
http_header[600] = 'text/plain';
http_header[304] = 'text/plain';

function handle_route(request,response,next){

	var request_url = url.parse(request.url,true);
	var pathname = request_url.pathname;
	var headers = request.headers;
	//logger.log("QUERY_SERVER","pathname:" + pathname);
	if(!(pathname in route)){
		next(new Error(pathname + ' is not in route'));
	}
	if (typeof route[pathname] === 'function'){
		
		//logger.log("QUERY_SERVER","query params:\n" + util.inspect(request_url.query,{depth:null}) + "\n");

		route[pathname](headers,request_url.query,function(error_code,content){

			logger.log("QUERY_SERVER","QUERY RESULT: \n" + util.inspect(content,{depth:null}) + "\n");

			if(error_code == 0){
				let status_code = 200;
				response.writeHead(status_code, {
					'Content-Type': http_header[status_code]
				});
				response.write(JSON.stringify(content));				
			}else{
				logger.error("QUERY_SERVER","Error pathname:" + pathname + " error_code = " + error_code);
				response.writeHead(200, {
					'Content-Type': http_header[200]
				});
				var json_content = {};
				json_content['error'] = error_code;
				response.write(JSON.stringify(json_content));
			}
			response.end();
		});
	}else{
		next(new Error(pathname + ' is not in route'));
	}
}

function handleError(err, req, res, next){
	logger.error("QUERY_SERVER",err);
	res.writeHead(500, {
		'Content-Type': http_header[500]
	});
	res.end();
}



function handle_test(req,rsp,next){
	var request_url = url.parse(req.url,true);
	var pathname = request_url.pathname;
	var headers = req.headers;
	
	if(pathname in test_route){
		test_route[pathname](headers,request_url.query,function(err,rsp_data){
			logger.log(rsp_data);
		});
		response.writeHead(200, {
			'Content-Type': http_header[200]
		});
		response.end();
		return;
	}
	next();
}


function printCostTime(req,rsp,time){

	logger.log("QUERY_SERVER","COST TIME: " + url.parse(req.url,true).pathname + " : " + time + "ms");
}

exports.start = function(Host,Port)
{
	var app = connect()
	.use(favicon("favicon.ico"))
	.use(responseTime(printCostTime))
	.use(handle_test)
	.use(handle_login)
	.use(handle_route)
	.use(handleError)
	app.listen(Port);
}