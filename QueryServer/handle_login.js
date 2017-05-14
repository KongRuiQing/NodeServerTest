'use strict';
var PlayerCache = require("../playerList.js");

var handle_login = function(req,rsp,next){
	let headers = req.headers;
	if('guid' in headers){
		let guid = headers['guid'];

		let uid = PlayerCache.getUid(guid);
		if(uid != null){
			headers['uid'] = Number(uid);
			
		}else{
			headers['uid'] = 0;
		}
	}else{
		console.log('guid is null');
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