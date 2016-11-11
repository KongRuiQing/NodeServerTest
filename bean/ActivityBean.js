
var moment = require('moment');

var ActivityBean = function(){
	this.id = 0;
	this.name = "";
	this.discard = 0.0;
	this.image = "";
	this.shop_id = 0;
	this.uid = 0;
	this.expire_time = "";
}


ActivityBean.prototype.initFromDb = function(db_row){
	this.id = Number(db_row['id']);
	this.name = db_row['name'];
	this.discard = parseFloat(db_row['discard']);
	this.image = db_row['image'];
	this.shop_id = Number(db_row['shop_id']);
	this.uid = Number(db_row['uid']);
	this.expire_time = db_row['expire_time'];
}

ActivityBean.prototype.getJsonValue = function(){
	return {
		'id' : this.id,
		'name' : this.name,
		'discard' : this.discard,
		'image' : this.image,
		'shop_id' : this.shop_id,
		'uid' : this.uid,
		'expire_time' : this.expire_time
	};
}

ActivityBean.prototype.getShopId = function(){
	return this.shop_id;
}

ActivityBean.prototype.isExpireTime = function(){
	var now = Date.now();
	return moment(this.expire_time).isBefore(moment(now));
}

ActivityBean.prototype.setExpireTime = function(add_days){
	var now = Date.now();
	this.expire_time = moment(now).add(add_days,'day').format('YYYY-MM-DD HH:mm:ss');
}

ActivityBean.prototype.addExpireTime = function(add_days){
	this.expire_time = moment(this.expire_time).add(add_days,'day').format('YYYY-MM-DD HH:mm:ss');
}

ActivityBean.prototype.getId = function(){
	return this.id;
}

ActivityBean.prototype.newActivityBean = function(id,shop_id,uid){
	this.id = id;
	this.shop_id = shop_id;
	this.uid = uid;
}

ActivityBean.prototype.setActivityInfo = function(name,discard,image){
	this.name = name;
	this.discard = parseFloat(discard);
	this.image = image;
}

module.exports = ActivityBean;