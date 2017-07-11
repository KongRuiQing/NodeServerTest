'use strict';
var sms = require("../proxy/sms.js");
var moment = require("moment");

var _db = require("../db_sequelize");
var AppConfig = require('config');
var logger = require("../logger.js").logger()

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
	constructor(telephone, verify_code) {
		this.__telephone = telephone;
		this.__verify_code = verify_code;
		this.__expire_time = null; // 24小时内不能注册 
		this.__last_time = moment().add(AppConfig.get("Find.sms_time"), 's'); // 最后一次发送的时间 + 80s
		this.__count = 1;
		this.time_format = "YYYY-MM-DD HH:mm:ss";
	}

	initFromDb(db_row) {
		this.__telephone = db_row['telephone'];
		this.expire_time = db_row['expire_time'];
		this.__last_time = moment(db_row['last_time'], this.time_format);
		this.__count = Number(db_row['count']);
		this.__verify_code = db_row['verify_code'];
	}

	checkCanSend() {
		
		let now = moment();
		// 还没有发送过
		if (this.__last_time == null) {
			return null;
		}
		// 刚发过
		if (now.isBefore(this.__last_time)) {

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
	isBeforeLastTime() {
		let now = moment();
		if (this.__last_time == null) {
			return false;
		}
		return now.isBefore(this.__last_time);
	}
	getLeftTime() {
		let now = moment();
		if (this.__last_time == null) {
			return AppConfig.get("Find.sms_time");
		}
		return this.__last_time.diff(now, 'seconds');
	}
	isMatch(verify_code) {
		logger.log("INFO",typeof verify_code,typeof this.__verify_code);
		if (verify_code === this.__verify_code) {
			let now = moment();
			if (this.__last_time != null) {
				let last_send_time = this.__last_time.subtract(AppConfig.get("Find.sms_time"), 's');
				if (last_send_time.isBefore(now) && now.diff(last_send_time, 'days', true) <= 1) {
					return true;
				}
				return false;
			}

		}
		return false;
	}
	reSend(verify_code) {
		this.__verify_code = verify_code;

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
			'verify_code': this.verify_code,
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
	set expire_time(string) {
		if (string.length == 0) {
			this.__expire_time = null;
		} else {
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
	get verify_code() {
		if (this.__verify_code == null) {
			return "";
		}
		return this.__verify_code;
	}
}

class VerifyCodeService {
	constructor() {
		this.__cache = new Map();
	}

	addVerifyCodeInfo(db_row) {

		let verify_code_info = new VerifyCodeInfo();
		verify_code_info.initFromDb(db_row);
		this.__cache.set(verify_code_info.telephone, verify_code_info);
	}
	checkCanSend(telephone) {
		if (this.__cache.has(telephone)) {

			return this.__cache.get(telephone).checkCanSend();
		}
		return null;
	}

	// 
	create(telephone, callback) {
		let that = this;
		if (this.__cache.has(telephone)) {
			let verify_code_info = this.__cache.get(telephone);
			if (verify_code_info.isBeforeLastTime()) {
				callback(null, verify_code_info.getLeftTime());
				return;
			} else {

				that.send_sms(telephone, RegisterConfig.generateVerifyCode(), (error) => {
					callback(error, AppConfig.get("Find.sms_time"));
				});
				return;
			}
		} else {

			that.send_sms(telephone, RegisterConfig.generateVerifyCode(), (error) => {
				callback(error, AppConfig.get("Find.sms_time"))
			});
			return;
		}
		callback(1, verify_code_info.getLeftTime());
		return;

	}
	check(telephone, verify_code) {
		let that = this;

		if (this.__cache.has(telephone)) {
			let verify_code_info = this.__cache.get(telephone);
			logger.log("INFO","[VerifyCodeService][check] verify_code_info:",verify_code_info.getDbRow());
			return verify_code_info.isMatch(verify_code);
		}
		logger.log("INFO","[VerifyCodeService][check] telephone:",telephone);
		return false;
	}
	remove(telephone){
		if(this.__cache.has(telephone)){
			this.__cache.delete(telephone);
		}
	}

	send_sms(telephone, verify_code, callback) {
		logger.log("INFO",'[VerifyCodeService] send_sms','telephone:', telephone, 'verify_code:', verify_code)
		let that = this;
		sms.send_sms(telephone, verify_code, (error) => {
			if (!error) {
				let verify_code_info = null;
				if (that.__cache.has(telephone)) {
					verify_code_info = that.__cache.get(telephone);
					verify_code_info.reSend(verify_code);
				} else {
					verify_code_info = new VerifyCodeInfo(telephone, verify_code);
					that.__cache.set(telephone, verify_code_info);
				}
				_db.updateVerifyCodeInfo(verify_code_info.getDbRow(), (db_err) => {
					callback(db_err);
					return;
				})
				return;
			} else {
				logger.log("ERROR",'[VerifyCodeService] send_sms error:',error);
				callback(error);
				return;
			}

		});
	}
}

module.exports = new VerifyCodeService();