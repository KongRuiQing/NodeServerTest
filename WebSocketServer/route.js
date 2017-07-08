'use strict';

var http_login = require("./script/login.js");
var http_connection = require("./script/connection.js")
var handle_logout = require("./script/logout.js")
var handle_group_chat = require("./script/group_chat.js")
var logger = require('../logger').logger();

function __error(app,socket,msg){
	logger.log("ERROR","[WebSocketApp][__error] error this :",msg);
}

var handle_map = {};

handle_map['connection'] = http_connection;
handle_map['login'] = http_login;
handle_map['error'] = __error;
handle_map['logout'] = handle_logout;
handle_map['group_chat'] = handle_group_chat;
module.exports = handle_map;