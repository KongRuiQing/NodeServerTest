'use strict';

var PlayerManager = require("../../playerList.js");

module.exports = function(server,socket,jsonData){

	server.logout(socket);
}