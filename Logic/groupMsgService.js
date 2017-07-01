'use strict';

var GroupMsgBean = require("../bean/GroupMsgBean.js");
var _db = require("../db_sequelize");
var logger = require("../logger.js").logger();

class GroupMsgService {
	constructor() {
		this.__all_msg = new Map();
	}

	addFromDb(db_row) {
		let bean = new GroupMsgBean(db_row);
		if (this._getShopGroupMsgList(bean.getShopId()) != null) {
			this.__all_msg.get(bean.getShopId()).push(bean);
		} else {
			let list = [];
			list.push(bean);
			this.__all_msg.set(bean.getShopId(),list);
		}
	}
	_getShopGroupMsgList(shop_id) {
		if (this.__all_msg == null) {
			return null;
		}
		if (this.__all_msg.has(shop_id)) {
			return this.__all_msg.get(shop_id);
		}
		return null;
	}

	_loadFromDb(shop_id, callback) {
		let that = this;
		_db.syncGroupMsgByShopId(shop_id, (db_rows) => {
			
			for (var key in db_rows) {
				
				that.addFromDb(db_rows[key]);
			}
			callback();
		});
	}

	getShopGroupMsgList(shop_id, callback) {
		shop_id = Number(shop_id);

		if (this._getShopGroupMsgList(shop_id) == null) {
			this._loadFromDb(shop_id, () => {
				callback(this._getShopGroupMsgList(shop_id));
			});
		} else {
			callback(this._getShopGroupMsgList(shop_id));
		}
	}

	clearGroupMsg(shop_id){
		if(this.__all_msg.has(shop_id)){
			this.__all_msg.delete(shop_id);
		}
	}
	removeGroupMsg(shop_id,msg_id){
		if(this.__all_msg.has(shop_id)){
			let list = this.__all_msg.get(shop_id);
			let find_index = list.findIndex((element)=>{
				return shop_id == element.getShopId();
			});
			if(find_index >= 0){
				list.splice(find_index,1);
			}
		}
	}



}


module.exports = new GroupMsgService();