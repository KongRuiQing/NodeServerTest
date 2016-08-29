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

exports.getShopList = function(query,callback){
	db.getShopAfterFilter(
		query['city_no'],
		query['area_code'],
		query['cate_code'],
		query['sort_key'],
		query['page'],function(success,content){
		if(success){
			callback(0,content);
		}else{
			callback(1,content);
		}
	});
}

exports.getShopDetail = function(query,callback)
{
	var uid = query['uid'] || "";
	db.getShopDetail(query['shop_id'], uid,function(success,content){
		if(success){
			var json_value = {};
			json_value['show_image'] = content['show_image'];
			json_value['attention_count'] = parseInt(content['attention_count']);
			json_value['has_attention'] = content['has_attention'];

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

	var city_no = query['city_no'] || "";
	var area_code = query['area_code'] || '';
	var cate_code = query['category'] || '';
	var sort_code = query['sortby'] || '';
	var page = query['page'] || '';
	db.getAllShopSpread(query['page'],{
		'city_no':city_no,
		'area_code':area_code,
		'cate_code':cate_code,
		'sort_code':sort_code},
		function(success,content){
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

exports.getExchangeItemList = function(query,callback){
	var uid = query['uid'];
	db.getExchangeItemList(function(success,content){
		if(success){
			callback(0,content)
		}else{
			callback(1,content);
		}
	});
}
exports.getExchangeItemDetail = function(query,callback){
	var item_id = parseInt(query['item_id']);
	db.getExchangeItemDetail(item_id,function(success,content){
		if(success){
			callback(0,content)
		}else{
			callback(1,content);
		}
	});
}