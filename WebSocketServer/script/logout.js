'use strict';

let OnlineModule = require("../../Logic/online.js");

module.exports = function(server,socket,jsonData){
	let uid = socket.uid;
	if(uid > 0){
		OnlineModule.logout(uid);
	}
	server.reply(socket,'logout',{});
}