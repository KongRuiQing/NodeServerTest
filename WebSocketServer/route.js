'use strict';

var http_login = require("./script/login.js");
var http_connection = require("./script/connection.js")
var handle_map = {};

handle_map['connection'] = http_connection;
handle_map['login'] = http_login;

module.exports = handle_map;