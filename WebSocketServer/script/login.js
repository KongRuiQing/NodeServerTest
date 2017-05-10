'use strict';

var PlayerManager = require("../../playerList.js");

module.exports = function(server,socket,jsonLogin){
	
	if('guid' in jsonLogin && 'nid' in socket){
		let uid = PlayerManager.getUid(jsonLogin['guid']);
		socket.uid = uid;
		server.login(uid,socket.nid);
	}
}