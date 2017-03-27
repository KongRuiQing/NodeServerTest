'use strict';
var HttpHeadInstance = require("../HttpHeadInstance");
var util = require('util');
var logger = require("../logger").logger();
var url=require('url');

var handle_head = function(req,rsp,next){
	

	let result = HttpHeadInstance.getInstance().checkModified(req);

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
}

module.exports = handle_head;