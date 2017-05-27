'use strict';

var http_login = require("./script/login.js");
var http_connection = require("./script/connection.js")
var handle_logout = require("./script/logout.js")

var logger = require('../logger').logger();

function __error(app,socket,msg){
	logger.log("ERROR","[WebSocketApp][__error] error this :");
}

var handle_map = {};

handle_map['connection'] = http_connection;
handle_map['login'] = http_login;
handle_map['error'] = __error;
handle_map['logout'] = handle_logout;
module.exports = handle_map;