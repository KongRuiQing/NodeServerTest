var moment = require('moment');
var logger = require('../logger').logger();
var SchedulteRouteBean = function(index){
	this.uid = 0;
	this.id = 0;
	this.sort_key = index;
	this.image = "";
	this.shop_id = [];
	this.schedule_info = {};
	this.date = "";
	this.cache_json_value = {};
	this.dirty_flag = true;
};

var SchedulteRouteShopBean = function(shop_id){
	this.date = "";
	this.image = {};
	this.comment = "";
	this.id = 0;
	this.shop_id = shop_id;
};

SchedulteRouteShopBean.prototype.initFromDbRow = function(db_row){
	this.date = "";
}
SchedulteRouteShopBean.prototype.setComment = function(comment){
	this.comment = comment;
}
SchedulteRouteShopBean.prototype.addImage = function(image_index,image){
	this.image[image_index] = image;
}
SchedulteRouteShopBean.prototype.getJsonValue = function(){
	return {
		'shop_id' : this.shop_id,
		'schedule_info' : {
			'comment' : this.comment,
			'image' : this.imageToList(),
		},
		'shop_info' : {}
	};
}

SchedulteRouteShopBean.prototype.imageToList = function(){
	var list = [];
	for(var key in this.image){
		list.push(this.image[key]);
	}
	return list;
}

SchedulteRouteShopBean.prototype.ChangeScheduleImage = function(image_index,image){
	this.image[image_index] = image;
}

SchedulteRouteBean.prototype.initFromDbRow = function(db_row) {
	this.uid = Number(db_row['uid']);
	this.id = Number(db_row['id']);
	this.sort_key = Number(db_row['sort_index']);
	this.image = db_row['image'];
};

SchedulteRouteBean.prototype.setUid = function(uid){
	this.uid = uid;
}
SchedulteRouteBean.prototype.getId = function(){
	return this.id;
}

SchedulteRouteBean.prototype.addShop = function(shop_id){
	if(this.ownShop(shop_id)){
		return false;
	}
	this.shop_id.push(shop_id);
	this.schedule_info[shop_id] = new SchedulteRouteShopBean(shop_id);
}
SchedulteRouteBean.prototype.addShopImage = function(shop_id,image_index,image){
	if(this.ownShop(shop_id)){
		this.schedule_info[shop_id].addImage(image);
	}
}

SchedulteRouteBean.prototype.setComment = function(shop_id,comment){
	if(this.ownShop(shop_id)){
		return false;
	}else{
		this.schedule_info[shop_id].setComment(comment);
	}
	return true;
}

SchedulteRouteBean.prototype.ownShop = function(shop_id){
	for(var key in this.shop_id){
		if(this.shop_id[key] == shop_id){
			return true;
		}
	}
	return false;
}

SchedulteRouteBean.prototype.setScheduleImage = function(image){
	this.image = image;
}

SchedulteRouteBean.prototype.addShopComment = function(comment){
	if(this.ownShop(shop_id)){
		this.shop_info[shop_id].setComment(comment);
	}
}

SchedulteRouteBean.prototype.getJsonValue = function(){
	if(!this.dirty_flag){
		return this.cache_json_value;
	}else{

		this.cache_json_value = {
			'uid' : this.uid,
			'id' : this.id,
			'sort_key' : this.sort_key,
			'image' : this.image,
			'schedule_info' : []
		};

		for(var key in this.shop_id){
			var shop_id = this.shop_id[key];
			if(shop_id in this.schedule_info){
				this.cache_json_value['schedule_info'].push(this.schedule_info[shop_id].getJsonValue());
			}else{
				this.cache_json_value['schedule_info'].push({
					'image' : "",
				});
			}
			
		}

		this.dirty_flag = false;
		return this.cache_json_value;
	}
}

SchedulteRouteBean.prototype.ChangeScheduleImage = function(shop_id,image_index,image){
	if(shop_id in this.schedule_info){
		this.schedule_info[shop_id].ChangeScheduleImage(image_index,image);
		this.dirty_flag = true;
	}
}

SchedulteRouteBean.prototype.ChangeScheduleRouteImage = function(image){
	this.image = image;
	this.dirty_flag = true;
}

module.exports = SchedulteRouteBean;



