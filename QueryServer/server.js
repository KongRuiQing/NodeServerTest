'use strict';

var http = require('http');
var url = require('url');

var http_test = require("./http_test");
var logger = require('../logger').logger();
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

var query_num = 1;

function handle_route(request, response, next) {

	var request_url = url.parse(request.url, true);
	var pathname = request_url.pathname;
	var headers = request.headers;
	
	if (!(pathname in route)) {
		next(new Error(pathname + ' is not in route'));
		return;
	}

	if (typeof route[pathname] === 'function') {

		query_num = query_num + 1;
		logger.log("INFO", "[%d][%s] params:%s",query_num,pathname,request_url.query);

		new Promise((resolve, reject) => {
			route[pathname](headers, request_url.query, function(error_code, content) {

				logger.log("INFO", "[%d] result:[%s]",query_num,content);
				
				if (error_code == 0) {
					resolve(content);
				} else {
					reject(error_code);
				}
			});
		}).then((content) => {
			let status_code = 200;
			response.writeHead(status_code, {
				'Content-Type': http_header[status_code],
				'Cache-Control': 'Cache-Control: public, max-age=60,max-stale=120'
			});
			response.end(JSON.stringify(content));
		}).catch((error_code) => {
			
			response.writeHead(200, {
				'Content-Type': http_header[200],
			});
			let json_content = {};
			json_content['error'] = error_code;
			response.end(JSON.stringify(json_content));
		});

	} else {
		next(new Error(pathname + ' is not in route'));
		return;
	}
}

function handleError(err, req, res, next) {
	logger.error("INFO", err);
	res.writeHead(500, {
		'Content-Type': http_header[500],
	});

	res.end(util.inspect(err));
}



function handle_test(req, rsp, next) {
	var request_url = url.parse(req.url, true);
	var pathname = request_url.pathname;
	var headers = req.headers;

	if (pathname in test_route) {

		test_route[pathname](headers, request_url.query, function(err, rsp_data) {
			logger.log('INFO', rsp_data);
			rsp.writeHead(200, {
				'Content-Type': http_header[200]
			});
			rsp.end(rsp_data);

		});

		return;
	}
	next();
}


function printCostTime(req, rsp, time) {

	logger.log("INFO", url.parse(req.url, true).pathname, " COST TIME: " + " : " + time + "ms");
}
var app = null;
exports.start = function(Host, Port) {
	if (app == null) {
		var app = connect()
			.use(favicon("favicon.ico"))
			.use(responseTime(printCostTime))
			.use(handle_test)
			.use(handle_login)
			.use(handle_route)
			.use(handleError)
		app.listen(Port);
		logger.log("INFO", 'STAET QUERY_SERVER');
	} else {
		logger.log("ERROR", 'restart  server');
	}

}