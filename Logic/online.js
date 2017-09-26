'use strict';
var moment = require('moment');
var WebSocket = require("../WebSocketServer");
var logger = require("../logger.js").logger();
var ErrorCode = require("../error.js");
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

class OnlineInfo{
	constructor(){
		this.__uid = 0;
		this.__socket_id = "";
		this.__guid = "";
	}
	bind(uid,nid){
		this.__uid = uid;
		this.__socket_id = nid;
		this.__guid = generate(11);
	}

	get socket_id(){
		return this.__socket_id;
	}
	get guid(){
		return this.__guid;
	}
}

class Online{
	constructor(){
		this.__online = new Map();

		this.__online_guid = new Map();
	}
	notifyUserLoginStateChange(uid,state){
		if(state != 0){

			this.sendMessage(uid,"kickoff",{'error' : state});

			this.logout(uid);
		}
		
	}

	isLogin(uid){
		if(this.__online.has(uid)){
			return this.__online.get(uid).socket_id;
		}
		return null;
	}
	getUidByGuid(guid){
		if(this.__online_guid.has(guid)){
			return this.__online_guid.get(guid);
		}
		return 0;
	}
	registerLogin(uid,nid){
		if(this.__online.has(uid)){
			let guid = this.__online.get(uid).guid;
			this.__online_guid.delete(guid);
			this.__online.delete(uid);
		}
		let online_info = new OnlineInfo();

		online_info.bind(uid,nid);
		this.__online_guid.set(online_info.guid,uid);
		this.__online.set(uid,online_info);

		return online_info.guid;
	}
	sendMessage(uid,cmd,data){
		logger.log("INFO",`${uid} send ${cmd} data:`,data);
		let socket_id = this.isLogin(uid);
		if(socket_id != null){
			WebSocket.sendMessage(socket_id,cmd,data);
			
		}
	}
	broadcast(cmd,data){
		WebSocket.broadcast(cmd,data);
	}

	logout(uid){
		if(this.__online.has(uid)){
			let guid = this.__online.get(uid).guid;
			this.__online_guid.delete(guid);
			this.__online.delete(uid);
		}
	}
	kickoff(uid){
		if(this.__online.has(uid)){
			let online_info = this.__online.get(uid);
			logger.log("INFO",'[Online][kickoff] online_info:',online_info);
			let socket_id = this.__online.get(uid).socket_id;
			this.sendMessage(uid,"kickoff",{'error' : ErrorCode.KICKOFF_BY_DELETE_USER});
			this.logout(uid);
		}else{
			logger.log("INFO",'[Online][kickoff]',`uid:[${uid}] is not online`);
		}
	}
}

module.exports = new Online();