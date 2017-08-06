var http = require('http');
var path = require('path');
var url = require('url');
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

function printCostTime(req, rsp, time) {

	logger.log("QUERY_SERVER", "COST TIME: " + url.parse(req.url, true).pathname + " : " + time + "ms");
}

function handle_post(pathname, headers, fields, files, response) {
	logger.log("INFO", "[POST_SERVER] handle_post:", pathname, " fields:", fields);

	new Promise((resolve, reject) => {
		handle_http[pathname](headers, fields, files, (success, json_result) => {

			logger.log("INFO", "handle_post:",pathname," response:\n" + util.inspect(json_result));

			resolve(json_result);

		});
	}).then((json_result) => {
		response.writeHead(200, {
			'content-type': 'text/html'
		});

		response.end(JSON.stringify(json_result));
	}).catch((error)=>{
		logger.log("ERROR",error);
		response.writeHead(500, {
			'content-type': 'text/html'
		});
		response.end("");
	});

}

function handle_route(request, response, next) {
	var pathname = url.parse(request.url).pathname;
	if (!(pathname in handle_http)){
		next(new Error(pathname + " no in handle_http"));
		return;
	}
	if (request.method.toLowerCase() === 'post') {
		var form = new formidable.IncomingForm();
		form.uploadDir = "assets/upload/";
		form.maxFields = 1000;
		form.maxFieldsSize = 2 * 1024 * 1024;
		form.keepExtensions = true;
		var headers = request.headers;
		form.parse(request, function(err, fields, files) {
			if (err) {
				next(new Error(err));
				return;
			}
			try {
				handle_post(pathname, headers, fields, files, response);
				
			} catch (exc_err) {
				next(new Error(exc_err));
				return;
			}
		});
	} else {
		next(new Error("Not post method"));
		return;
	}
}


function handle_Error(err, req, res, next) {
	logger.error("ERROR", "POST_SERVER:error", err);
	res.writeHead(500, {
		'Content-Type': "text/plain"
	});
	res.end();
}

exports.start = function(Host, Port) {
	var app = connect()
		.use(favicon("favicon.ico"))
		.use(responseTime(printCostTime))
		.use(handle_login)
		.use(handle_route)
		.use(handle_Error)
	app.listen(Port);
}