'use strict'
class GroupMsgBean{
	constructor(){
		this.__shop_id = 0;
		this.__msg = "";
		this.__image = [];
		this.__time = null;
	}
	constructor(db_row){
		this.__shop_id = Number(db_row['shop_id']);
	}
}


module.exports = GroupMsgBean;