var http = require('http');
var path=require('path');
var url=require('url');
const fs = require('fs');
var formidable = require('formidable');
var util = require('util');
var logger = require('../logger').logger();
var http_handler = require("./http_handler");

var server = null;

var form = new formidable.IncomingForm();
var handle_http = {};
handle_http['/become_seller'] = http_handler.become_seller;
handle_http['/login'] = http_handler.login;

exports.start = function(Host,Port)
{
	form.uploadDir = "assets/upload/";
	form.maxFields = 1000;
	form.maxFieldsSize = 2 * 1024 * 1024;
	form.keepExtensions = true;
	server = http.createServer(function (request, response) {
		var pathname = url.parse(request.url).pathname;
		if(request.method.toLowerCase() === 'post'){

			form.parse(request, function(err, fields, files) {
				if(err){
					logger.error("UPLOAD",err);
					response.end("123");
					return;
				}

				handle_http[pathname](fields,files,function(success,json_result){
					response.writeHead(200, {'content-type': 'text/plain'});
					response.end(JSON.stringify(json_result));
				});
			});
		}
	});
	server.listen(Port,Host);
	logger.log("START","POST Server runing at port: " + Port + ".");
}