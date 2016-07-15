var db = require("../mysqlproxy");
var util = require('util');
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
			var json_value = {};
			json_value['show_image'] = content['show_image'];
			json_value['attention'] = 0;
			json_value['name'] = content['shop_name'];
			json_value['shop_id'] = content['shop_id'];
			json_value['info'] = content['info'];
			json_value['promotion_image'] = 'shop/promotion/1.png';
			json_value['recommend_list'] = [];
			callback(0,json_value);
		}else{
			callback(1,content);
		}
	});
}

exports.getAdImage = function(query,callback){
	db.getAdImage(function(success,content){
		if(success){
			var json_value = {};
			json_value['ad_image'] = [];
			
			for(var i in content){
				json_value['ad_image'].push(content[i]);
			}

			callback(0,json_value);
		}else{
			callback(1,null);
		}
	});
}

exports.getShopSpread = function(query,callback){

	var city_no = query['city_no'] || "167";
	var area_code = query['area_code'] || '';
	var cate_code = query['category'] || '';
	var sort_code = query['sortby'] || '';
	db.getAllShopSpread(query['page'],{
		'city_no':city_no,
		'area_code':area_code,
		'cate_code':cate_code,
		'sort_code':sort_code},function(success,content){
		if(success){
			var json_value = {};
			json_value['page'] = query['page'];
			json_value['spread_list'] = content;
			callback(0,json_value);
		}else{
			callback(1,null);
		}
	});
}