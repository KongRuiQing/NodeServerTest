'use strict';
var OnlineModule = require("../Logic/online.js");

var handle_login = function(req,rsp,next){
	let headers = req.headers;

	if('guid' in headers){
		let guid = headers['guid'];
		let uid = OnlineModule.getUidByGuid(guid);
		headers['uid'] = uid;
	}else{
		if(!('uid' in headers)){
			headers['uid'] = 0;
		}else{
			headers['uid'] = Number(headers['uid']);
		}
	}
	next();
}

module.exports = handle_login;