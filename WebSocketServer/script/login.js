'use strict';

var PlayerManager = require("../../playerList.js");

module.exports = function(server,socket,jsonLogin){
	
	

	if('guid' in jsonLogin){
		let uid = PlayerManager.getUid(jsonLogin['guid']);
		socket.uid = uid;
		server.register(uid,socket);
		server.sendMessage(uid,'cmd',{'guid' : jsonLogin['guid']});
	}
}