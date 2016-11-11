var moment = require('moment');

var ShopComment = function(){
	this.uid = 0;
	this.comment = "";
	this.datetime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
	this.remark = "";
}

ShopComment.prototype.initFromDbRow = function(db_row){
	this.uid = Number(db_row['uid']);
	this.comment = db_row['comment'];
	this.datetime = db_row['datetime'];
	this.remark = db_row['remark'];
}

ShopComment.prototype.newShopComment = function(){

}

module.exports = ShopComment;