'use strict';

var sms = require("../proxy/sms.js")
function getUTC() {  
	var d = new Date();  
	return Date.UTC(d.getFullYear()  
		, d.getMonth()  
		, d.getDate()  
		, d.getHours()  
		, d.getMinutes()  
		, d.getSeconds()  
		, d.getMilliseconds());  
} 

function generate(count) {
	var _sym = 'abcdefghijklmnopqrstuvwxyz1234567890';
	var str = '';

	for(var i = 0; i < count; i++) {
		str += _sym[parseInt(Math.random() * (_sym.length))];
	}

	str += getUTC();

	return str;
}


class RegisterConfig{
	static get VERIFY_CODE_NUM(){
		return 4;
	}
	static GetRandomNum(){
		var Rand = Math.random();   
		return (Math.round(Rand * 10)) % 10;   
	}
	static generateVerifyCode(){
		
		var chars = ['0','1','2','3','4','5','6','7','8','9'];
		var result = "";
		for(var i = 0; i < this.VERIFY_CODE_NUM ; i ++){
			result += chars[this.GetRandomNum()];
		}
		return result;
	}
}


class RegisterInfo{
	constructor(telephone){
		this.__register_id = generate(8);
		this.__telephone = telephone;
		this.__verify_code = RegisterConfig.generateVerifyCode();
		this.__password = "";
	}
	get registerId(){
		return this.__register_id;
	}
	get verifyCode(){
		return this.__verify_code;
	}
}
class Register{
	constructor(){
		this.__register_info = new Map();
	}

	getRegisterInfo(register_id){
		return this.__register_info.get(register_id);
	}

	createRegisterInfo(telephone){



		let register_info = new RegisterInfo(telephone);

		this.__register_info.set(register_info.registerId,register_info);
		sms.send_sms(telephone,register_info.verifyCode);
		return register_info.registerId;
	}

	checkVerifyCode(register_id,telephone,verify_code){
		if(!this.__register_info.has(register_id)){
			return false;
		}
		let register_info = this.getRegisterInfo(register_id);
		if(register_info != null){
			if(verify_code == register_info.verifyCode){
				return true;
			}
		}
		return false;
	}
	removeRegisterInfo(register_id){
		this.__register_info.delete(register_id);
	}
}

module.exports = new Register();