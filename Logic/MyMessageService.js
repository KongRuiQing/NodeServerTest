'use strict';
var logger = require("../logger.js").logger();
var MessageEventDispatcher = require("../EventDispatcher/MessageEventDispatcher.js");
var db = require("../db_sequelize");
var Online = require("./online.js");
var assert = require('assert');
class MessageDetail {
	constructor(type, content) {
		logger.log("INFO", type, content);
		this.type = type;

		this.content = content;
	}

}
class Message {
	constructor() {
		this.id = 0;
		this.image = "";
		this.title = "";
		this.info = "";
		this.detail = null;

		this.createdAt = 0;
		this.updatedAt = 0;
		this.deletedAt = 0;
	}
	getId() {
		return this.id;
	}
	isUpdateMessage(time) {
		return this.deletedAt > time || this.updatedAt > time || this.createdAt > time;
	}
	getUpdateTime() {
		let local_time = Math.max(this.createdAt, this.updatedAt);
		return Math.max(local_time, this.deletedAt);
	}
	InitFromDbRow(db_row) {
		logger.log("INFO", db_row);
		this.id = Number(db_row['id']);
		this.image = db_row['image'];
		this.title = db_row['title'];
		this.info = db_row['info'];

		this.detail = new MessageDetail(Number(db_row['detail_type']), db_row['detail_content']);

		this.createdAt = Number(db_row['createdAt']);
		this.updatedAt = Number(db_row['updatedAt']);
		this.deletedAt = Number(db_row['deletedAt']);

	}
	getJSON() {

		return {
			'id': this.id,
			'image': this.image,
			'title': this.title,
			'info': this.info,
			'type': this.detail.type,
			'content': this.detail.content,
			'deletedAt': this.deletedAt,
			'updatedAt': this.updatedAt,
			'createdAt': this.createdAt,
		}
	}

}

class QueryInterface {
	constructor(service) {
		this.service = service;
	}
	loadUserMessage(last_time) {
		let all_message = this.service.getAllMessage();
		let result = [];
		for (let message of all_message) {
			if (message.isUpdateMessage(last_time)) {
				result.push(message.getJSON());
			}
		}
		logger.log("INFO", "result:", result);
		return result;
	}
}

class MessageHolder {
	constructor(service) {
		this.service = service;
		this.all_message = [];
		this.last_time = 0;
		this.isInitFromDb = false;
		this.loadAllMessageFromDb();
	}
	loadAllMessageFromDb() {
		let that = this;

		db.fetchAllMessage(this.last_time, (message_list) => {
			that.fetchAllMessage(message_list);
		});
	}
	fetchAllMessage(message_list) {
		if (message_list == null) {
			logger.log("WARN","message_list is null");
			return;
		}
		logger.log("INFO","message_list:",message_list);
		let should_notify_user = this.isInitFromDb;
		logger.log("INFO","should_notify_user:",should_notify_user);

		let notify_change_list = [];
		for (let message of message_list) {
			let message_id = message['id'];
			let find_bean = false;
			for (let bean of this.all_message) {
				if (message_id == bean.getId()) {
					bean.InitFromDbRow(message);
					find_bean = true;
					this.last_time = Math.max(this.last_time, bean.getUpdateTime());
					if (should_notify_user) {
						notify_change_list.push(bean.getJSON());
					}

					break;
				}
			}
			if (!find_bean) {
				let bean = new Message();
				bean.InitFromDbRow(message);
				this.last_time = Math.max(this.last_time, bean.getUpdateTime());
				if (should_notify_user) {
					notify_change_list.push(bean.getJSON());
				}
				this.all_message.push(bean);
			}
		}
		
		if (should_notify_user && notify_change_list.length > 0) {
			Online.broadcast(
				"user_message", 
				{
					'list': notify_change_list
				}
			);
		}
		if(!this.isInitFromDb){
			this.isInitFromDb = true;
		}
	}

}

class MyMessageService {
	constructor() {
		this.name = "MyMessageService";
		this.query = new QueryInterface(this);
		this.holder = new MessageHolder(this);
		this.bindEvent();

		logger.log("INFO", "MyMessageService constructor");
	}
	bindEvent() {
		let that = this;
		MessageEventDispatcher.bindEvent("on_message_change", () => {
			that.onMessageChange();
		});
	}
	onMessageChange() {
		assert(this);
		assert(this.name == "MyMessageService", "this is error");
		this.holder.loadAllMessageFromDb();
	}
	getQuery() {
		logger.log("INFO", "getQuery");
		return this.query;
	}

	getAllMessage() {
		return this.holder.all_message;
	}

}

let _instance = new MyMessageService();

module.exports = _instance;