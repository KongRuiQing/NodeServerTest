'use strict';
var HttpHeadInstance = require("../HttpHeadInstance");
var util = require('util');
var logger = require("../logger").logger();
var url=require('url');

var handle_head = function(req,rsp,next){
	let headers = req.headers;
	let key = "if-modified-since";
	let request_url = url.parse(req.url,true);
	if(key in headers){
		
		let result = HttpHeadInstance.getInstance().checkModified(request_url,headers,headers[key]);
		
		if(result != null){
			rsp.setHeader("Last-Modified",result);
			next();
		}else{
			logger.log("HTTP_HANDLE",req.url," response 304");
			rsp.writeHead(304, {
				'Content-Type': "text/html",
			});
			rsp.end();
			return;
		}
	}else{
		let result = HttpHeadInstance.getInstance().checkModified(request_url,null);
		
		rsp.setHeader("Last-Modified",result);
		headers['Last-Modified'] = result;
		next();
	}
}

module.exports = handle_head;