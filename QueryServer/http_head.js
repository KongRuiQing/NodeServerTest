'use strict';
var HttpHeadInstance = require("../HttpHeadInstance");
var util = require('util');
var logger = require("../logger").logger();

var handle_head = function(req,rsp,next){
	let headers = req.headers;
	var key = "if-modified-since";
	
	if(key in headers){
		
		let result = HttpHeadInstance.getInstance().checkModified(req.url,headers[key]);
		
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
		let result = HttpHeadInstance.getInstance().checkModified(req.url,null);
		
		rsp.setHeader("Last-Modified",result);
		headers['Last-Modified'] = result;
		next();
	}
}

module.exports = handle_head;