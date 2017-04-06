'use strict';
var PlayerCache = require("../playerList.js");

var handle_login = function(req,rsp,next){
	let headers = req.headers;

	if('guid' in headers){
		let guid = headers['guid'];

		let uid = PlayerCache.getUid(guid);
		if(uid != null){
			headers['uid'] = uid;
			
		}else{
			headers['uid'] = 0;
		}
	}else{
		//console.log("headers:" + headers);
	}
	next();
}

module.exports = handle_login;