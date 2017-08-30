'use strict';

var GroupChatBean = require("../bean/GroupChatBean.js");
var _db = require("../db_sequelize");
var logger = require("../logger.js").logger();
var OnlineService = require("./online.js");
var PlayerService = require("../playerList.js");
class GroupChat {
	constructor() {
		this.__last_chat_time = null;
		this.__all_msg = [];
		this.__group = new Set();
	}



	addChat(bean) {
		this.__all_msg.push(bean);
		this._updateLastChatTime(bean.getTime());
		this.__group.add(bean.getUID());
	}
	_updateLastChatTime(time){
		if (this.__last_chat_time == null) {
			this.__last_chat_time = time;
		} else {
			if (time.isAfter(this.__last_chat_time)) {
				this.__last_chat_time = time;
			}
		}
	}

	getChat(time) {
		if (this.__last_chat_time == null) {
			logger.log("INFO","[groupChatService][getChat] chat is null","");
			return [];
		}
		logger.log("INFO", "[groupChatService][getChat] time:", time.unix(), " __last_chat_time:", this.__last_chat_time.unix());
		if (time.isAfter(this.__last_chat_time)) {
			return [];
		}

		let isAfterTime = function(bean) {
			return bean.getTime().isAfter(time);
		}
		let filter_msg = this.__all_msg.filter(isAfterTime);
		//logger.log("INFO",filter_msg);
		return filter_msg.slice(0, 300);
	}

	notifyNewGroupChat(bean) {
		for (let send_to of this.__group) {
			let json = bean.getJson();
			let player = PlayerService.getInstance().getPlayer(bean.getUID());
			if (player != null) {
				json['head'] = player.getHead();
			}

			OnlineService.sendMessage(send_to, 'group_chat', json);
		}
	}
}

class Service {
	constructor() {
		this.__all_chat = new Map();
		this.__last_chat_time = new Map();
	}

	addFromDb(db_row) {
		//logger.log("INFO","[groupChatService][addFromDb] db_row:",db_row);
		let bean = new GroupChatBean(db_row);
		let shop_id = bean.getShopId();
		if (this.__all_chat.has(shop_id)) {
			this.__all_chat.get(shop_id).addChat(bean);
		} else {
			let group_chat = new GroupChat();
			group_chat.addChat(bean);
			this.__all_chat.set(shop_id, group_chat);
		}
		return bean;
	}
	addFromApp(db_row) {
		//logger.log("INFO", "[groupChatService][addFromApp] db_row:", db_row);
		let bean = this.addFromDb(db_row);

		this._notifyOther(bean);

	}
	_notifyOther(bean) {
		let groupChat = this.__all_chat.get(bean.getShopId());
		if (groupChat != null) {
			groupChat.notifyNewGroupChat(bean);
		} else {
			logger.log('ERROR', 'No groupChat with shop_id = ', bean.getShopId());
		}
	}
	getChatInShop(shop_id, last_login_time) {
		if (this.__all_chat.has(shop_id)) {
			return this.__all_chat.get(shop_id).getChat(last_login_time);
		}else{
			logger.log("INFO","not this shop",'shop_id:',shop_id," typeof shop_id",typeof shop_id);
		}
		return [];
	}

	getGroupChatLogin(last_login_time, shop_id_list) {
		//logger.log("INFO", "[groupChatService][getGroupChatLogin] last_login_time,shop_id_list", last_login_time.unix(), shop_id_list);
		let result = [];

		for (let shop_id of shop_id_list) { //this.getChatInShop(shop_id,0)
			let list = this.getChatInShop(shop_id, last_login_time);

			for (let bean of list) {
				//logger.log("INFO","getGroupChatLogin:",bean);
				let json = bean.getJson();
				let player = PlayerService.getInstance().getPlayer(bean.getUID());
				if (player != null) {
					json['head'] = player.getHead();
				}
				result.push(json);
			}
		}
		//logger.log("INFO","getGroupChatLogin result:",result );
		return result;
	}
	getGroupChatUser(shop_id) {
		if (this.__all_chat.has(shop_id)) {

		}
		return [];
	}
}


module.exports = new Service();