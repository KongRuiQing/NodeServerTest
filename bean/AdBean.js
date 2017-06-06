"use strict";

var AdBean = function(DbRow){
	this.__id = Number(DbRow['id']);
	this.position = Number(DbRow['position']);
	this.index = Number(DbRow['index']);
	this.image = DbRow['image'];
	this.shop_id = DbRow['shop_id'] || 0;
	this.url = DbRow['url'] || "";
};


AdBean.prototype.getJsonValue = function(){
	return {
		'position' : this.position,
		'index' : this.index,
		'image' : this.image,
		'url' : this.url,
		'shop_id' : this.shop_id,
	};
}

AdBean.prototype.getIndex = function(){
	return this.index;
}

AdBean.prototype.getPosition = function(){
	return this.position;
}
AdBean.prototype.getId = function(){
	return this.__id;
}

AdBean.prototype.setImage = function(image){
	this.image = image;
}


module.exports = AdBean;