"use strict";

var AdBean = function(DbRow){
	this.position = Number(DbRow['position']);
	this.index = Number(DbRow['index']);
	this.image = DbRow['image'];
	//this.shop_id = DbRow['shop_id'];

};


AdBean.prototype.getJsonValue = function(){
	return {
		'position' : this.position,
		'index' : this.index,
		'image' : this.image
	};
}


module.exports = AdBean;