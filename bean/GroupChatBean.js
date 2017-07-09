'use strict'
var moment = require("moment");

class GroupChatBean {

	constructor(db_row) {
		this.__id = Number(db_row['id']);
		this.__uid = Number(db_row['uid']);
		this.__msg = db_row['msg'];
		this.__shop_id = Number(db_row['shop_id']);
		this.__time = moment(db_row['createdAt']);

	}
	getShopId() {
		return this.__shop_id;
	}

	getTime() {
		return this.__time;
	}
	getUID(){
		return this.__uid;
	}

	

	getJson(){
		return {
			'id' : this.__id,
			'uid' : this.__uid,
			'shop_id' : this.__shop_id,
			'msg' : this.__msg,
			'createdAt' : this.__time.unix()
		};
	}
}


module.exports = GroupChatBean;