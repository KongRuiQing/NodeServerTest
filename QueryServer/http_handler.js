'use strict';
var db = require("../mysqlproxy");
var util = require('util');
var ShopCache = require("../cache/shopCache");
var PlayerCache = require("../playerList.js");
var DbCache = require("../cache/DbCache");
var logger = require("../logger").logger();
var fs = require('fs');
const path = require('path');
var moment = require('moment');
var down_file_name = "";
var down_file_version = "";

function watchApkVersion(root_path){

	var files = fs.readdirSync(root_path);
	var max_apk_num = 0;
	var down_file_version = "";
	files.forEach(function(file){

		var pathname = root_path+'/'+file;
		var parse_result = path.parse(pathname);
		
		if(parse_result['ext'] == ".apk"){

			var arr = parse_result['name'].split('.');
			var apk_version_num = 0;
			var apk_version_name = "";
			arr.forEach(function(num){
				apk_version_name = apk_version_name + "" + num;
			});
			apk_version_num = Number(apk_version_name);
			//console.log(apk_version_num);
			if(max_apk_num < apk_version_num){
				max_apk_num = apk_version_num;
				down_file_version = parse_result['name'];
			}

		}
	});

	return {
		"version_name" : down_file_version,
		"version_info" : ""
	}
}

exports.getAreaMenu = function(headers, query,callback){
	let last_modified_time = null;
	if('If-Modified-Since' in query){
		last_modified_time = moment(query['If-Modified-Since']).format('YYYY-MM-DD HH:mm:ss');
	}
	let city = Number(query['city']);
	logger.log("HTTP_HANDER","[getAreaMenu]:query=" + util.inspect(query));
	var json_result = DbCache.getInstance().getAreaMenu(last_modified_time,city);
	
	callback(0,json_result);
	
}

exports.getShopList = function(headers, query,callback){
	
	var zone = Number(query['area_code'] || 0) ;
	var city = Number(query['city_no'] || 0);
	//var guid = headers['guid'];
	var uid = headers['uid']
	if(city == 0) city = 167;
	var category = Number(query['cate_code'] || 0) ;

	var page_size = 10;
	if('page_size' in query){
		page_size = Number(query['page_size'] || 0);
	}
	var search_key = "";
	if('search_key' in query){
		search_key = query['search_key'];
	}
	
	var longitude = 0.0;
	if('longitude' in headers){
		longitude = Number(headers['longitude']);
	}
	var latitude = 0.0;
	if('latitude' in headers){
		latitude = Number(headers['latitude']);
	}
	var distance = -1.0;
	if('distance' in query){
		distance = Number(query['distance']);
	}
	let last_distance = 0;
	if('last_distance' in query){
		last_distance = Number(query['last_distance']);
	}
	logger.log("HTTP_HANDER","getShopList param: category = ", category,'city='
		,city,'page_size='
		,page_size,'search_key=,'
		,search_key,'longitude='
		,longitude,'latitude'
		,latitude,'latitude'
		,last_distance,'last_distance'
		);

	var shop_list = ShopCache.getInstance().getShopList(uid,city,zone,category,last_distance,page_size,search_key,longitude,latitude,distance);


	var json_result = {
		"list" : shop_list['list'],
		'page_size' : page_size,
		'length' : shop_list['list'].length,
		'last_distance' : shop_list['last_distance'],
	}
	callback(0,json_result);
}

exports.getShopDetail = function(headers, query,callback)
{
	var uid = query['uid'] || 0;
	
	var shop_id = Number(query['shop_id']);

	var json_result = null;

	if(shop_id > 0){
		json_result = ShopCache.getShopDetail(uid,shop_id);

		if(json_result != null){
			json_result['error'] = 0;
			callback(0,json_result);
			return;
		}else{
			callback(0,{
				'error' : 1004
			});
		}
	}else{
		callback(0,{
			'error' : 1006
		});
	}

	
	
}

exports.getAdImage = function(headers, query,callback){
	
	var position = Number(query['position']);
	var json_result = DbCache.getInstance().getShopAd(position);
	var json_value = {
		'position' : position,
		'ad_image' : json_result
	};
	
	callback(0,json_value);
	
	
}

exports.getShopSpread = function(headers, query,callback){

	var city_no = query['city_no'] || "";
	var area_code = query['area_code'] || '';
	var cate_code = query['category'] || '';
	var sort_code = query['sortby'] || '';
	let distance = Number(query['distance'] || "0");
	let longitude = parseFloat(headers['longitude']);
	let latitude = parseFloat(headers['latitude']);

	
	let last_distance = Number(query['last_distance']);
	
	var keyword = "";
	if('keyword' in query){
		keyword = query['keyword'];
	}
	logger.log("HTTP_HANDER:",'city_no=',city_no,'area_code=',area_code,'cate_code=',cate_code);
	

	var query_result = ShopCache.getInstance().getShopSpread(last_distance,longitude,latitude,city_no,area_code,distance,cate_code,keyword);
	var json_value = {
		'spread_list' : query_result['list'],
		'page_size': 30,
		'length' : query_result['list'].length,
		'last_distance' : query_result['last_distance'],
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

exports.getMyShopItemDetail = function(headers,query,callback){
	var uid = headers['uid'];

	if(uid > 0){
		let shop_id = PlayerCache.getInstance().getMyShopId(uid);
		let item_id = Number(query['item_id']);
		var shop_item_detail = ShopCache.getInstance().getMyShopItemDetail(uid,shop_id,item_id);
		if(shop_item_detail != null){
			callback(0,{
				"item_info" : shop_item_detail,
			});
			return;
		}else{
			callback(0,{
				'error' : 2,
				'error_msg' : "没有找到对应的商品信息",
			});
			return;
		}
	}else{
		callback(0,{
			'error':1002,
			'error_msg' : "没有登录",
		});
		return;
	}
}

exports.getShopItemDetail = function(headers, query,callback){
	var uid = headers['uid'];
	var shop_id = query['shop_id'];
	var item_id = query['item_id'];

	var shop_item_detail = ShopCache.getInstance().getShopItemDetail(uid,shop_id,item_id);
	if('error' in shop_item_detail && Number(shop_item_detail['error']) != 0){
		callback(0,shop_item_detail);
		return;
	}else{
		delete shop_item_detail['error'];
		
		var json_result = {
			'error' : 0,
			'shop_id' : shop_id,
			'item_id' : item_id,
			'item_detail' : shop_item_detail
		};

		callback(0,json_result);
		return;
	}
	

	
}

exports.getMyFavoritesItems = function(headers, query,callback){

	var page = query['page'];
	var guid = headers['guid'];

	var favorites_items = PlayerCache.getMyFavoritesItems(guid,page);
	
	var list = ShopCache.getMyFavoritesItems(favorites_items);
	var json_result = {
		'list':list,
		'page':page
	};
	callback(0,json_result);
}

exports.getApkVersion = function(headers, query,callback){

	var json_result = watchApkVersion("./down/apk/");
	//return json_result;
	callback(0,json_result);
}

exports.getMyAttention = function(headers, query,callback){

	//logger.log("HTTP_HANDER","start getMyAttention ");
	//logger.log("HTTP_HANDER","headers :" + util.inspect(headers));

	var guid = headers['guid'];
	
	var list = PlayerCache.getMyAttention(guid);
	

	var json_result = {
		'page' : query['page'],
		'list' : ShopCache.getMyAttentionShopInfo(list)
	};

	callback(0,json_result);
}

exports.getCategory = function(headers,query,callback){
	let type = Number(query['type']);
	let list_result = [];
	if(type == 2){
		list_result = DbCache.getInstance().getItemCategory();
	}else if(type == 1){
		list_result = DbCache.getInstance().getShopCategory();
	}
	
	callback(0,{
		'list':list_result,
		'type' : type,
	});
}


exports.getShopArea = function(headers,query,callback){
	logger.log("HTTP_HANDER","start getShopArea");
	var json_result = DbCache.getInstance().getShopArea();
	callback(0,json_result);

}
exports.getMyShopItemList = function(headers,query,callback){
	//logger.log("HTTP_HANDER","start getMyShopItemList");
	var json_result = ShopCache.getInstance().getMyShopItemList(headers['uid']);
	callback(0,json_result);
}
exports.getMyShopInfo = function(headers,query,callback){
	logger.log("HTTP_HANDER","start getMyShopInfo uid: " + headers['uid']);

	var json_result = ShopCache.getInstance().getMyShopBasicInfo(headers['uid'],true);

	callback(0,json_result);
}

exports.getMyActivity = function(headers,query,callback){
	logger.log("HTTP_HANDER","start getMyActivity");
	if('guid' in headers){
		var user_info = PlayerCache.checkMyActivity(headers['guid']);
		if(user_info != null){
			var json_result = ShopCache.getMyActivity(user_info);
			json_result['error'] = 0;
			json_result['price'] = 1;
			callback(0,json_result);
			return;
		}else{
			callback(0,{
				'error' : 2
			});
			return;
		}

	}
	
	callback(0,{
		'error' : 1
	});
	return;
}

exports.getGameShopList = function(headers,query,callback){

	var zone = Number(query['area_code'] || 0);
	var city = Number(query['city_no'] || 0);
	var guid = headers['guid'];

	var category = Number(query['cate_code'] || 0) ;

	var uid = PlayerCache.getUid(guid);
	
	var json_result = {'error' : 0};
	if(city == 0){
		json_result['error'] = 1010;
		callback(true,json_result);
		return;
	}
	if(uid == 0){
		json_result['error'] = 1001;
		callback(true,json_result);
		return;
	}


	var page_size = 10;
	
	var shop_list = ShopCache.getGameShopList(uid,city,zone,category,page_size);
	
	json_result['list'] = shop_list;
	json_result['count'] = shop_list.length;

	callback(0,json_result);
}

exports.getShopAttentionBoard = function(headers,query,callback){

	var area_code = Number(query['area_code'] || 0);
	var city = Number(query['city_no'] || 0);
	var guid = headers['guid'];
	var search_key = query['search_key'] || "";

	var category = Number(query['cate_code'] || 0) ;

	var uid = PlayerCache.getUid(guid);
	var page = Number(query['page'] || 1);
	var page_size = 15;
	var json_value = ShopCache.getShopAttentionBoard(uid,city,area_code,category,search_key);

	var json_result = {
		'count' : json_value.length,
		'page' : page,
		'list':json_value.slice((page - 1) * page_size,page * page_size),
	}
	
	callback(0,json_result);
}

exports.getMyScheduleRouteInfo = function(headers,query,callback){
	var guid = headers['guid'];
	//var uid = PlayerCache.getUid(guid);
	var json_result = PlayerCache.getMyScheduleRouteInfo(guid);
	//
	ShopCache.fillScheduleShopInfo(json_result);
	
	callback(0,json_result);
}

exports.getBeSellerData = function(headers,query,callback)
{
	var json_result = {};

	json_result['category'] = DbCache.getInstance().getShopCategory();
	let shop_id = PlayerCache.getInstance().getMyShopId(headers['uid']);
	logger.log("HTTP_HANDER","shop_id:" + shop_id + " uid:" + headers['uid']);
	if(shop_id > 0){
		json_result['shop_info'] = ShopCache.getInstance().getMyShopSellerInfo(shop_id);
	}
	
	callback(0,json_result);

}

exports.getShopClaimState = function(headers,query,callback)
{
	let shop_id = Number(query['shop_id']);
	let uid = headers['uid'];
	if(uid == 0){
		callback(0,{
			'error' : 1001,
		});
		return;
	}
	let check_result = PlayerCache.getInstance().chekcCanClaim(uid);
	if(check_result == false){
		callback(0,{
			'error' : 1001,
			'error_msg' : '用户不满足认领条件',
		});
		return;
	}
	
	if(shop_id > 0){
		let json_result = ShopCache.getInstance().getShopClaimState(shop_id);

		callback(0,json_result);
	}else{
		callback(0,{
			'error' : 1,
			'error_msg' : '不存在商铺'
		});
		return;
	}
}