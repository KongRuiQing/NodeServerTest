
var moment = require('moment');

var ActivityBean = function(){

	this.title = "";
	this.image = "";
	this.shop_id = 0;
	this.createdTime = 0;
}


ActivityBean.prototype.initFromDb = function(db_row){
	
	if('title' in db_row){
		this.title = db_row['title'];
	}
	
	if('image' in db_row){
		this.image = db_row['image'];
	}
	
	this.shop_id = Number(db_row['shop_id']);
	
	if('createdAt' in db_row){
		this.createdTime = moment(db_row['createdAt']).unix();
	}else{
		this.createdTime = moment().unix();
	}
	
}

ActivityBean.prototype.getJsonValue = function(){
	return {
		
		'title' : this.title,
		'image' : this.image,
		'shop_id' : this.shop_id,
		
	};
}

ActivityBean.prototype.getShopId = function(){
	return this.shop_id;
}


module.exports = ActivityBean;