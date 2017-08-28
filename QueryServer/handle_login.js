'use strict';
var OnlineService = require("../Logic/online.js");

var handle_login = function(req,rsp,next){
	let headers = req.headers;
	if('guid' in headers){
		let guid = headers['guid'];

		let uid = OnlineService.getUidByGuid(guid);
		if(uid != null){
			headers['uid'] = Number(uid);
			
		}else{
			headers['uid'] = 0;
		}
	}else{
		
		headers['uid'] = 0;
	}
	if(!('longitude' in headers)){
		headers['longitude'] = 0;
	}
	if(!('latitude' in headers)){
		headers['latitude'] = 0;
	}
	next();
}

module.exports = handle_login;