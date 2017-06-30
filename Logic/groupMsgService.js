'use strict';

var GroupMsgBean = require("../bean/GroupMsgBean.js");

class GroupMsgService(){
	constructor(){
		this.__all_msg = new Map();
	}

	addFromDb(db_row){
		let bean = new GroupMsgBean(db_row);
		if(this.getShopGroupMsgList(bean.getShopId()) != null){
			this.__all_msg.get(bean.getShopId()).push(bean);
		}else{
			let list = [];
			list.push(bean);
			this.__all_msg.set(shop_id,list);
		}
	}
	_getShopGroupMsgList(shop_id){
		if(this.__all_msg == null){
			return null;
		}
		if(this.__all_msg.has(shop_id)){
			return this.__all_msg.get(shop_id);
		}
		return null;
	}

	_loadFromDb(shop_id,callback){
		let that = this;
		_db.syncGroupMsgByShopId(shop_id,(db_rows)=>{
			for (row of db_rows) {
				that.addFromDb(row);
			}
			callback();
		});
	}

	getShopGroupMsgList(shop_id,callback){
		if(this._getShopGroupMsgList(shop_id) == null){
			this._loadFromDb(shop_id,()=>{
				callback(this._getShopGroupMsgList(shop_id));
			});
		}else{
			callback(this._getShopGroupMsgList(shop_id));
		}
	}




}


module.exports = new GroupMsgService();
