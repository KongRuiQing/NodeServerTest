'use strict';
var logger = require("../logger.js").logger();

class LoginState{
	constructor(){

	}
	static get LOGIN_NORMAL(){
		return 0;
	}

	static get LOGIN_CLOSE(){
		return 1;
	}

	static get MAX_LOGIN_STATE(){
		return 2;
	}
	static parseValue(state){
		if(state < this.MAX_LOGIN_STATE && state >= 0){
			return state;
		}
		return this.MAX_LOGIN_STATE - 1;
	}
}
class LoginInfo{
	constructor(){
		this.__password = "";
		this.__uid = 0;
		this.__state = LoginState.LOGIN_NORMAL;
	}
	setLoginInfo(uid,password,state){
		this.__password = password;
		this.__uid = uid;
		this.setState(state);
	}
	setState(state){
		this.__state = LoginState.parseValue(state);;
	}
	getUID(){
		return this.__uid;
	}

	getPassword(){
		return this.__password;
	}
	getState(){
		return this.__state;
	}

	toJSONObject(){
		return {
			'uid' : this.getUID(),
			'state' : this.getState(),
		};
	}
}
class Login{
	constructor(){
		this.__login = new Map();
		
		logger.log("INFO",'[LoginModule]','account size:',this.__login.size);
	}

	addLoginInfo(account,uid,password,state){
		if(this.__login.has('account')){

		}else{
			//logger.log('INFO',"add account:",account,'typeof accoount'  , typeof account);
			let loginInfo = new LoginInfo();
			loginInfo.setLoginInfo(uid,password,state);
			this.__login.set(account,loginInfo);
		
		}
	}
	changeLoginState(uid,state){
		this.__login.forEach((loginInfo)=>{
			if(uid == loginInfo.getUID()){
				loginInfo.setState(state);
			}
		})
	}
	
	checkLogin(account,password){
		if(!this.__login.has(account)){
			logger.log("ERROR",`${account} is a register user`);
			return {'error' : 1011};
		}
		let loginInfo = this.__login.get(account);
		if(loginInfo == null){
			return {'error' : 1011};
		}
		if(password != loginInfo.getPassword()){
			return {'error' : 1008};
		}
		if(loginInfo.getState() != LoginState.LOGIN_NORMAL){
			return {'error' : 1009,'state' : loginInfo.getState()};
		}

		return {
			'error' : 0,
			'login_info' : loginInfo.toJSONObject()
		};

	}

	checkAccount(telephone) {
		return this.__login.has(telephone);
	}
	removeUser(uid){
		let find_key = null;
		this.__login.forEach((login_info,login_key)=>{
			if(login_info.getUID() == uid){
				find_key = login_key;
			}
		});
		if(find_key != null){
			this.__login.delete(find_key);
		}
	}

	printData(){
		logger.log("INFO",'[LoginModule]','account size:',this.__login.size);
	}
}


module.exports = new Login();