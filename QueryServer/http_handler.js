var db = require("../mysqlproxy");

exports.getAreaMenu = function(query,callback){

	db.getAreaMenu(query["area_code"],function(success,content){
		
		if(success){
			callback(0,content);
		}else{
			callback(1,null);
		}
		
	});
}

exports.getShop = function(query,callback){
	db.getShopAfterFilter(query['city_no'],query['area_code'],query['cate_code'],query['sort_key'],query['page'],function(success,content){
		if(success){
			callback(0,content);
		}else{
			callback(1,content);
		}
	});
}

exports.getShopDetail = function(query,callback)
{
	db.getShopDetail(query['shopid'],function(success,content){
		if(success){
			callback(0,content);
		}else{
			callback(1,content);
		}
	});
}