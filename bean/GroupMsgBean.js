'use strict'
var moment = require("moment");
class GroupMsgBean{
	
	constructor(db_row){
		this.__id = Number(db_row['id']);
		this.__shop_id = Number(db_row['shop_id']);
		this.__msg = db_row['msg'];
		this.__image = [];
		this.__image.push(db_row['image1']);
		this.__image.push(db_row['image2']);
		this.__image.push(db_row['image3']);
		this.__image.push(db_row['image4']);
		this.__image.push(db_row['image5']);
		this.__image.push(db_row['image6']);
		this.__image.push(db_row['image7']);
		this.__image.push(db_row['image8']);
		this.__image.push(db_row['image9']);

		this.__time = moment(db_row['createdAt']);
	}

	getJsonValue(){
		return {
			'id' : this.__id,
			'shop_id' : this.__shop_id,
			'msg' : this.__msg,
			'images' : this.__image,
			'time' : this.__time.format("YYYY.MM.HH hh:MM:SS"),
		}
	}
	getShopId(){
		return this.__shop_id;
	}
}


module.exports = GroupMsgBean;
