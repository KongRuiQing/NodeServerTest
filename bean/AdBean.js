"use strict";

var AdBean = function(DbRow){
	this.image = DbRow['image'];
	this.shop_id = DbRow['shop_id'];
};


AdBean.prototype.getJsonValue = function(){
	return {
		'image' : this.image,
		'shop_id' : this.shop_id,
	};
}


module.exports = AdBean;