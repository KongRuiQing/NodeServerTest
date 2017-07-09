'use strict';

var GroupChatBean = require("../bean/GroupChatBean.js");
var _db = require("../db_sequelize");
var logger = require("../logger.js").logger();
var OnlineService = require("./online.js");
class GroupChat {
	constructor() {
		this.__last_chat_time = null;
		this.__all_msg = [];
		this.__group = new Set();
	}

	addChat(bean){
		this.__all_msg.push(bean);
		this.__last_chat_time = bean.getTime();
		this.__group.add(bean.getUID());
	}
	
	getChat(time){
		let isAfterTime = function(bean){
			return bean.getTime().isAfter(time);
		}
		return this.__all_msg.filter(isAfterTime).slice(0,300);
	}

	notifyNewGroupChat(bean){
		for(let uid of this.__group){
			OnlineService.sendMessage(uid,'group_chat',bean.getJson());
		}
	}
}

class Service {
	constructor() {
		this.__all_chat = new Map();
		this.__last_chat_time = new Map();
	}

	addFromDb(db_row) {
		let bean = new GroupChatBean(db_row);
		let shop_id = bean.getShopId();
		if(this.__all_chat.has(shop_id)){
			this.__all_chat.get(shop_id).addChat(bean);
		}else{
			let group_chat = new GroupChat();
			group_chat.addChat(bean);
			this.__all_chat.set(shop_id,group_chat);
		}
		return bean;
	}
	addFromApp(db_row){
		let bean = this.addFromDb(db_row);

		this._notifyOther(bean);

	}
	_notifyOther(bean){
		let groupChat = this.__all_chat.get(bean.getShopId());
		if(groupChat != null){
			groupChat.notifyNewGroupChat(bean);
		}else{
			logger.log('ERROR','No groupChat with shop_id = ', bean.getShopId());
		}
	}
	getChatInShop(shop_id,last_login_time){
		if(this.__all_chat.has(shop_id)){
			return this.__all_chat.get(shop_id).getChat(last_login_time);
		}
		return [];
	}

	getGroupChatLogin(last_login_time,shop_id_list){
		let result = [];

		for(let shop_id of shop_id_list){ //this.getChatInShop(shop_id,0)
			let list = this.getChatInShop(shop_id,last_login_time);
			for(let bean of list){
				Array.prototype.push.apply(result,bean.getJson());
			}
			
			
		}
		return result;
	}
	getGroupChatUser(shop_id){
		if(this.__all_chat.has(shop_id)){
			
		}
		return [];
	}
}


module.exports = new Service();