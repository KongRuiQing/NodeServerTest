'use strict';

var sms = require("../proxy/sms.js");
var moment = require("moment");

var _db = require("../db_sequelize");
var AppConfig = require('config');

function getUTC() {
	var d = new Date();
	return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds());
}

function generate(count) {
	var _sym = 'abcdefghijklmnopqrstuvwxyz1234567890';
	var str = '';

	for (var i = 0; i < count; i++) {
		str += _sym[parseInt(Math.random() * (_sym.length))];
	}

	str += getUTC();

	return str;
}


class RegisterConfig {
	static get VERIFY_CODE_NUM() {
		return 4;
	}
	static GetRandomNum() {
		var Rand = Math.random();
		return (Math.round(Rand * 10)) % 10;
	}
	static generateVerifyCode() {

		var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
		var result = "";
		for (var i = 0; i < this.VERIFY_CODE_NUM; i++) {
			result += chars[this.GetRandomNum()];
		}
		return result;
	}
}

class VerifyCodeInfo {
	constructor(telephone) {
		this.__telephone = telephone;
		this.__expire_time = null; // 24小时内不能注册 
		this.__last_time = null; // 最后一次发送的时间 + 80s
		this.__count = 0;

		this.time_format = "YYYY-MM-DD HH:mm:ss";
	}

	initFromDb(db_row) {
		this.__telephone = db_row['telephone'];
		this.expire_time = db_row['expire_time'];
		this.__last_time = moment(db_row['last_time'], this.time_format);
		this.__count = Number(db_row['count']);
	}

	checkCanSend() {
		let now = moment();
		// 还没有发送过
		if (this.__last_time == null) {
			return null;
		}
		// 刚发过
		if (now.isBefore(this.__last_time)) {
			console.log("last:",this.__last_time.format("YYYY-MM-DD HH:mm:ss"));
			console.log("now :",now.format("YYYY-MM-DD HH:mm:ss"));
			return {
				'error': 1,
				'msg': this.__last_time.diff(now, 'seconds'),
			};
		}
		// 没有超过五次
		if (this.__expire_time == null) {
			return null;
		}
		// 已经超过五次了
		if (now.isBefore(this.__expire_time)) {
			return {
				'error': 2,
				'msg': this.__expire_time.format("YYYY-MM-DD"),
			};
		}

		return null;

	}
	addCount() {
		let now = moment();
		this.__last_time = now.add(AppConfig.get("Find.sms_time"), 's');
		if (this.__expire_time == null) {
			this.__count = this.__count + 1;
			if (this.__count >= 5) {
				this.__expire_time = moment(now.format("YYYY-MM-DD")).add(1, 'd');
			}
		} else {
			if (this.__expire_time.isBefore(now)) {
				this.__count = 1;
				this.__expire_time = moment(now.format("YYYY-MM-DD")).add(1, 'd');
			}
		}
	}

	getDbRow() {
		return {
			'telephone': this.telephone,
			'expire_time': this.expire_time,
			'last_time': this.last_time,
			'count': this.count,
		}
	}
	get telephone() {
		return this.__telephone;
	}
	get expire_time() {
		if (this.__expire_time == null) {
			return "";
		}
		return this.__expire_time.format(this.time_format);
	}
	set expire_time(string){
		if(string.length == 0){
			this.__expire_time = null;
		}else{
			this.__expire_time = moment(string, this.time_format);
		}
	}
	get last_time() {
		if (this.__last_time == null) {
			return "";
		}
		return this.__last_time.format(this.time_format);
	}
	get count() {
		return this.__count;
	}
}


class RegisterInfo {
	constructor(telephone) {
		this.__register_id = generate(8);
		this.__telephone = telephone;
		this.__verify_code = RegisterConfig.generateVerifyCode();
		this.__password = "";
	}
	get registerId() {
		return this.__register_id;
	}
	get verifyCode() {
		return this.__verify_code;
	}
}
class Register {
	constructor() {
		this.__register_info = new Map();
		this.__verify_code_info = new Map();
	}
	addRegister(db_row){
		let telephone = db_row['telephone'];
		this.__verify_code_info.set(telephone,new VerifyCodeInfo(telephone));
		this.__verify_code_info.get(telephone).initFromDb(db_row);
	}

	getRegisterInfo(register_id) {
		return this.__register_info.get(register_id);
	}

	checkTelephone(telephone) {
		if (this.__verify_code_info.has(telephone)) {
			let verifyCodeInfo = this.__verify_code_info.get(telephone);

			return verifyCodeInfo.checkCanSend();
		}

		return true;
	}

	checkCanSend(telephone) {
		if (this.__verify_code_info.has(telephone)) {
			let verify_code_info = this.__verify_code_info.get(telephone);

			return verify_code_info.checkCanSend();

		}
		return null;
	}

	createRegisterInfo(telephone, cb) {
		let db_row = null;
		let register_info = new RegisterInfo(telephone);
		this.__register_info.set(register_info.registerId, register_info);
		if (this.__verify_code_info.has(telephone)) {
			let verify_code_info = this.__verify_code_info.get(telephone);
			verify_code_info.addCount();
			db_row = verify_code_info.getDbRow();
		} else {
			let verify_code_info = new VerifyCodeInfo(telephone);
			verify_code_info.addCount();
			this.__verify_code_info.set(telephone, verify_code_info);

			db_row = verify_code_info.getDbRow();
		}
		_db.updateVerifyCodeInfo(db_row, (error) => {
			if (error) {
				cb(error);
			} else {
				cb(null, register_info.registerId);
			}
		});
		sms.send_sms(telephone,register_info.verifyCode);
	}

	checkVerifyCode(register_id, telephone, verify_code) {
		if (!this.__register_info.has(register_id)) {
			return false;
		}
		let register_info = this.getRegisterInfo(register_id);
		if (register_info != null) {
			if (verify_code == register_info.verifyCode) {
				return true;
			}
		}
		return false;
	}
	removeRegisterInfo(register_id) {
		this.__register_info.delete(register_id);
	}
}

module.exports = new Register();