'use strict';

var http_login = require("./script/login.js");

var handle_map = {};

handle_map['login'] = http_login;

module.exports = handle_map;