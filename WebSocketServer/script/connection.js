'use strict';


module.exports = function(server,socket,jsonData){
	
	if('nid' in jsonData){
		socket.nid = jsonData['nid'];
		server.register(socket);

		server.reply(socket,'connection',{});
	}
}