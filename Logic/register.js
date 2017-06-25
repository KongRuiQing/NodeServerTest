'use strict';

var sms = require("../proxy/sms.js");
var moment = require("moment");

var _db = require("../db_sequelize");
var AppConfig = require('config');


class RegisterInfo {
	constructor(telephone) {
		this.__register_id = generate(8);
		this.__telephone = telephone;
		this.__verify_code = ""
		this.__password = "";
	}
	get registerId() {
		return this.__register_id;
	}
}
class Register {
	constructor() {
		this.__register_info = new Map();
	}
	
}

module.exports = new Register();