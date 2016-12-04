"use strict";

var AdBean = function(){
	this.image = "";
	this.shop_id = 0;
};

AdBean.prototype.initFromDb = function(DbRow){
	this.imageg = DbRow['image'];
	this.shop_id = DbRow['shop_id'];
};

AdBean.prototype.getJsonValue = function(){
	return {
		'image' : this.image,
		'shop_id' : this.shop_id,
	};
}


module.exports = AdBean;