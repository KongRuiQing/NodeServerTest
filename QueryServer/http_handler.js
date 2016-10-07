var db = require("../mysqlproxy");
var util = require('util');
var ShopCache = require("../cache/shopCache");
var PlayerCache = require("../playerList.js");
var DbCache = require("../cache/DbCache.js");
var logger = require("../logger").logger();

exports.getAreaMenu = function(headers, query,callback){
	
	var json_result = DbCache.getAreaMenu(query['city_code']);
	callback(0,json_result);
	
}

exports.getShopList = function(headers, query,callback){
	var page = parseInt(query['page']) || 1;
	var zone = parseInt(query['area_code']) || 0;
	var city = parseInt(query['city_no']);
	var guid = headers['guid'];
	var uid = PlayerCache.getUid(guid);
	if(city == 0) city = 167;
	var category = parseInt(query['cate_code']) || 0;

	var shop_list = ShopCache.getShopList(uid,city,zone,category,page);
	var json_result = {
		"list" : shop_list['list'],
		'result' : 0,
		'page':page,
		'page_size' : 20,
		'count' : shop_list['count']
	}
	callback(0,json_result);
}

exports.getShopDetail = function(headers, query,callback)
{
	var uid = query['uid'] || "";
	var shop_id = query['shop_id'] || "";
	var json_result = null;
	if(shop_id != ""){
		json_result = ShopCache.getShopDetail(uid,shop_id);
	}else{
		json_result = {
			'result' : 2
		}
	}
	callback(0,json_result);
	
}

exports.getAdImage = function(headers, query,callback){
	
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

exports.getShopSpread = function(headers, query,callback){

	var city_no = query['city_no'] || "";
	var area_code = query['area_code'] || '';
	var cate_code = query['category'] || '';
	var sort_code = query['sortby'] || '';
	var page = query['page'] || '';
	var query_result = ShopCache.getShopSpread();
	var json_value = {
		'spread_list' : query_result
	};

	callback(0,json_value);
}

exports.getExchangeItemList = function(headers, query,callback){
	var uid = query['uid'];
	db.getExchangeItemList(function(success,content){
		if(success){
			callback(0,content)
		}else{
			callback(1,content);
		}
	});
}
exports.getExchangeItemDetail = function(headers, query,callback){
	var item_id = parseInt(query['item_id']);
	db.getExchangeItemDetail(item_id,function(success,content){
		if(success){
			callback(0,content)
		}else{
			callback(1,content);
		}
	});
}

exports.getActivityList = function(headers, query,callback){
	
	var page = query['page'] || 1;
	var size = 10;
	var json_result = ShopCache.getShopActivityList(page,size);

	callback(0,json_result);
	
}

exports.getNearShopList = function(headers, query,callback){
	var page = query['page'] || 1;
	var long = parseFloat(query['long']) || 0;
	var late = parseFloat(query['late']) || 0;
	var size = 20;

	var shop_list = ShopCache.GetNearShopList(long,late,page,size);
	var json_result = {
		'page':page,
		'list':shop_list
	};
	
	callback(0,json_result);
}

exports.getShopItemDetail = function(headers, query,callback){
	var uid = query['uid'];
	var shop_id = query['shop_id'];
	var item_id = query['item_id'];

	var shop_item_detail = ShopCache.getShopItemDetail(uid,shop_id,item_id);

	if(shop_item_detail['error'] == 0){
		shop_item_detail['error'] = null;
		var json_result = {
			'error' : 0,
			'shop_id' : shop_id,
			'item_id' : item_id,
			'item_detail' : shop_item_detail
		};
		
		callback(0,json_result);
		return;
	}

	callback(1,json_result);
}

exports.getMyFavoritesItems = function(headers, query,callback){

	console.log(query);

	var page = query['page'];
	var guid = query['guid'];
	//var item = g_playerlist.getMyFavoritesItems(guid,page);

	//var list = ShopCache.getMyFavoritesItems(item);
	var json_result = {
		'list':[
			{
				'add_favorites_time' : 20120000,
				'id' : 110,
				'shop_id' : 123,
				'shop_name': '商店111',
				'item_name': '名字111',
				'item_property':[
					{
						'property_name' : '属性',
						'property_value' : '2.0'
					},{
						'property_name' : '大小',
						'property_value' : '3.0'
					}
				],
				'price': 60,
				'image': 'favorites/1.png'
			},
			{
				'add_favorites_time' : 20120000,
				'id' : 111,
				'shop_id' : 123,
				'shop_name': '商店222',
				'item_name': '名字333',
				'item_property':[
					{
						'property_name' : '属性',
						'property_value' : '2.0'
					},{
					'property_name' : '大小',
					'property_value' : '3.0'
					},
				],
			'price': 20,
			'image': 'favorites/2.png'
			},
			{
				'add_favorites_time' : 20120000,
				'id' : 112,
				'shop_id' : 123,
				'shop_name': '商店222',
				'item_name': '名字333',
				'item_property':[
					{
						'property_name' : '属性',
						'property_value' : '2.0'
					},{
					'property_name' : '大小',
					'property_value' : '3.0'
					},
				],
			'price': 20,
			'image': 'favorites/1.png'
			},
			{
				'add_favorites_time' : 20120000,
				'id' : 113,
				'shop_id' : 123,
				'shop_name': '商店222',
				'item_name': '名字333',
				'item_property':[
					{
						'property_name' : '属性',
						'property_value' : '2.0'
					},{
					'property_name' : '大小',
					'property_value' : '3.0'
					},
				],
			'price': 20,
			'image': 'favorites/2.png'
			},
			{
				'add_favorites_time' : 20120000,
				'id' : 114,
				'shop_id' : 123,
				'shop_name': '商店222',
				'item_name': '名字333',
				'item_property':[
					{
						'property_name' : '属性',
						'property_value' : '2.0'
					},{
					'property_name' : '大小',
					'property_value' : '3.0'
					},
				],
			'price': 20,
			'image': 'favorites/3.png'
			}
		],
		'page':page
	};
	callback(0,json_result);
}

exports.getApkVersion = function(headers, query,callback){
	var json_result = {
		"version_name" : "1.2.0"
	}
	callback(0,json_result);
}

exports.getMyAttention = function(headers, query,callback){

	logger.log("HTTP_HANDER","start getMyAttention ");
	//logger.log("HTTP_HANDER","headers :" + util.inspect(headers));

	var guid = headers['guid'];
	
	var list = PlayerCache.getMyAttention(guid);
	var page = parseInt(query['page']);
	var result_list = list.slice((page - 1) *15,15);

	var json_result = {
		'page' : query['page'],
		'list' : ShopCache.getMyAttentionShopInfo(result_list)
	};

	callback(0,json_result);
}

exports.getShopCategory = function(headers,query,callback){
	logger.log("HTTP_HANDER","start getShopCategory ");
	var json_result = DbCache.getShopCategory();
	callback(0,{'list':json_result});
}

exports.getShopCategoryClass = function(headers,query,callback){
	logger.log("HTTP_HANDER","start getShopCategoryClass ");
	var json_result = DbCache.getShopCategoryClass();
	callback(0,{'list':json_result});
}