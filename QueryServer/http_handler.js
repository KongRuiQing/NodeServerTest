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
var WebSocketServer = require("../WebSocketServer");
var AttentionService = require("../Logic/Attentions.js");
var ShopService = require("../Logic/shop.js");
const assert = require('assert');
var AttentionBoardService = require("../Logic/AttentionBoard.js");
let FavoriteService = require("../Logic/favorite.js");
let ErrorCode = require("../error.js");
let GroupMsgService = require("../Logic/groupMsgService.js");
let ShopActivityService = require("../Logic/ShopActivityService.js");
var SpreadItemService = require("../Logic/SpreadItemService.js");

function watchApkVersion(root_path) {

	var files = fs.readdirSync(root_path);
	var max_apk_num = 0;
	var down_file_version = "";
	files.forEach(function(file) {

		var pathname = root_path + '/' + file;
		var parse_result = path.parse(pathname);

		if (parse_result['ext'] == ".apk") {

			var arr = parse_result['name'].split('.');
			var apk_version_num = 0;
			var apk_version_name = "";
			arr.forEach(function(num) {
				apk_version_name = apk_version_name + "" + num;
			});
			apk_version_num = Number(apk_version_name);
			//console.log(apk_version_num);
			if (max_apk_num < apk_version_num) {
				max_apk_num = apk_version_num;
				down_file_version = parse_result['name'];
			}

		}
	});

	return {
		"version_name": down_file_version,
		"version_info": ""
	}
}

exports.getAreaMenu = function(headers, query, callback) {
	let last_modified_time = null;
	if ('If-Modified-Since' in query) {
		last_modified_time = moment(query['If-Modified-Since']).format(
			'YYYY-MM-DD HH:mm:ss');
	}
	let city = Number(query['city']);
	logger.log("HTTP_HANDER", "[getAreaMenu]:query=" + util.inspect(query));
	var json_result = DbCache.getInstance().getAreaMenu(last_modified_time, city);

	callback(0, json_result);

}

exports.getShopList = function(headers, query, callback) {

	var zone = Number(query['area_code'] || 0);
	var city = Number(query['city_no'] || 0);
	//var guid = headers['guid'];
	var uid = headers['uid']
	if (city == 0) city = 167;
	var category = Number(query['cate_code'] || 0);

	var page_size = 10;
	if ('page_size' in query) {
		page_size = Number(query['page_size'] || 10);
	}
	var search_key = "";
	if ('search_key' in query) {
		search_key = query['search_key'];
	}

	var longitude = 0.0;
	if ('longitude' in headers) {
		longitude = Number(headers['longitude']);
	}
	var latitude = 0.0;
	if ('latitude' in headers) {
		latitude = Number(headers['latitude']);
	}
	var distance = -1.0;
	if ('distance' in query) {
		distance = Number(query['distance']);
	}
	let last_index = 0;
	if ('last_index' in query) {
		last_index = Number(query['last_index']);
	}
	logger.log("HTTP_HANDER", "getShopList param: category = ", category, 'city=',
		city, 'page_size=', page_size, 'search_key=,', search_key,
		'longitude=', longitude,
		'latitude=', latitude,
		'last_index=', last_index,
		'area_code=', zone
	);

	var shop_list = ShopCache.getInstance().getShopList(uid, city, zone, category,
		last_index, page_size, search_key, longitude, latitude, distance);


	var json_result = {
		"list": shop_list['list'],
		'page_size': page_size,
		'length': shop_list['list'].length,
		'total': shop_list['total'],
	}
	callback(0, json_result);
}

exports.getShopDetail = function(headers, query, callback) {
	var uid = headers['uid'] || 0;

	var shop_id = Number(query['shop_id']);

	var json_result = null;
	logger.log('INFO', '[getShopDetail]', "uid:", uid, 'shop_id:', shop_id);
	if (shop_id > 0) {
		json_result = ShopCache.getInstance().getShopDetail(shop_id);

		let error = 0;
		if (json_result == null) {
			error = 1004;
		} else {
			json_result['attention'] = AttentionService.isAttentionThisShop(uid,shop_id);
			if ('error' in json_result) {
				error = json_result['error'];
			}
		}

		if (error == 0) {
			callback(0, json_result);
			return;
		} else {
			callback(0, {
				'error': error
			});
			return;
		}
	} else {
		callback(0, {
			'error': 1006
		});
	}



}

exports.getAdImage = function(headers, query, callback) {

	var position = Number(query['position']);
	var json_result = DbCache.getInstance().getShopAd(position);
	var json_value = {
		'position': position,
		'ad_image': json_result
	};

	callback(0, json_value);


}

exports.getShopSpread = function(headers, query, callback) {

	var city_no = Number(query['city_no'] || 167);
	var area_code = Number(query['area_code'] || 0);
	var cate_code = query['category'] || '';
	var sort_code = query['sortby'] || '';
	let distance = Number(query['distance'] || "0");

	let longitude = 0.0;
	if ('longitude' in headers && !Number.isNaN(headers['longitude'])) {
		longitude = parseFloat(headers['longitude']);
	}
	let latitude = 0.0;
	if ('latitude' in headers && !Number.isNaN(headers['latitude'])) {
		latitude = parseFloat(headers['latitude']);
	}

	let last_distance = Number(query['last_distance'] || 0);

	let keyword = "";
	if ('keyword' in query) {
		keyword = query['keyword'];
	}
	logger.log("INFO", "[HTTP_HANDER]getShopSpread param:", city_no, area_code,
		cate_code, sort_code, distance, longitude, latitude, last_distance, keyword);

	//var query_result = ShopCache.getInstance().getShopSpread(last_distance,longitude, latitude, city_no, area_code, distance, cate_code, keyword);

	let spread_item_query = SpreadItemService.buildQuery();

	spread_item_query.withLongitude(longitude).withLatitude(latitude).withCity(city_no);
	spread_item_query.withArea(area_code).withSearch(keyword).withDistance(distance);
	spread_item_query.withLastDistance(last_distance);

	let query_result = SpreadItemService.getItemList(spread_item_query);

	var json_value = {
		'spread_list': [],
		'page_size': 0,
		'length': 0,
	};

	//logger.log("INFO", "query_result", query_result.length);

	if (query_result.length > 0) {
		let page_size = 30;
		if (query_result.length > page_size) {
			
			while (page_size < query_result.length) {
				let last_dis = query_result[page_size - 1]['distance'];
				let last_shop = query_result[page_size - 1]['shop_id'];
				if (last_shop == query_result[page_size]['shop_id']) {
					page_size += 1;
					continue;
				}
				if (Math.abs(last_dis - query_result[page_size]['distance']) <= 0.5) {
					page_size += 1;
					continue;
				}
			}
		}

		let arr_list = query_result.slice(0, page_size - 1);

		json_value['spread_list'] = arr_list;
		json_value['page_size'] = page_size;
		json_value['length'] = arr_list.length;
		//json_value['last_index'] = last_index + arr_list.length;


	} else {
		json_value['spread_list'] = [];
		json_value['length'] = 0;
	}



	callback(0, json_value);
}

exports.getExchangeItemList = function(headers, query, callback) {
	var uid = query['uid'];
	db.getExchangeItemList(function(success, content) {
		if (success) {
			callback(0, content)
		} else {
			callback(1, content);
		}
	});
}
exports.getExchangeItemDetail = function(headers, query, callback) {
	var item_id = parseInt(query['item_id']);
	db.getExchangeItemDetail(item_id, function(success, content) {
		if (success) {
			callback(0, content)
		} else {
			callback(1, content);
		}
	});
}

exports.getActivityList = function(headers, query, callback) {

	let begin_distance = Number(query['last_distance']);

	logger.log("INFO", "get headers:", headers['longitude'], headers['latitude']);

	ShopActivityService.getActivityList((list) => {

		let list_with_distance = [];
		for (let bean of list) {
			let shop_id = bean.getShopId();
			let shop_info = ShopCache.getInstance().getShop(shop_id);

			if (shop_info != null) {
				bean['distance'] = shop_info.calcDistance(headers['longitude'], headers['latitude']);
				let beanDistance = {
						'bean': bean,
						'distance':bean['distance'] ,
					}
					//logger.log("INFO",beanDistance['distance'],' ',begin_distance);
				if (beanDistance['distance'] > begin_distance) {
					list_with_distance.push(beanDistance);
				}
			} else {

			}

		}

		list_with_distance.sort((a, b) => {
			return a['distance'] - b['distance'];
		});

		let json_result = {
			'distance': 0,
			'list': [],
		};

		const page_size = 10;
		//logger.log("INFO","list_with_distance:",list_with_distance);
		if (list_with_distance.length > 0) {

			if (list_with_distance.length <= page_size) {
				for (let beanWithDistance of list_with_distance) {
					json_result['list'].push(beanWithDistance['bean']);
				}
				json_result['distance'] = list_with_distance[json_result['list'].length - 1]['distance'];
			} else {
				for (let i = 0; i < page_size; ++i) {
					json_result['list'].push(list_with_distance[i]['bean']);
				}
				for (let i = page_size; i < list_with_distance.length; ++i) {
					if (list_with_distance[json_result['list'].length - 1]['distance'] == list_with_distance[i]['distance']) {
						json_result['list'].push(list_with_distance[i]['bean']);
					} else {
						break;
					}
				}
				json_result['distance'] = list_with_distance[json_result['list'].length - 1]['distance'];
			}
		}


		callback(0, json_result);
	});



}

exports.getNearShopList = function(headers, query, callback) {
	var page = query['page'] || 1;
	var long = parseFloat(query['long']) || 0;
	var late = parseFloat(query['late']) || 0;
	var size = 20;

	var shop_list = ShopCache.GetNearShopList(long, late, page, size);
	var json_result = {
		'page': page,
		'list': shop_list
	};

	callback(0, json_result);
}

exports.getMyShopItemDetail = function(headers, query, callback) {
	var uid = headers['uid'];

	if (uid > 0) {
		let shop_id = ShopService.getOwnShopId(uid);
		let item_id = Number(query['item_id']);
		var shop_item_detail = ShopCache.getInstance().getMyShopItemDetail(uid,
			shop_id, item_id);
		if (shop_item_detail != null) {
			callback(0, {
				"item_info": shop_item_detail,
			});
			return;
		} else {
			callback(0, {
				'error': 2,
				'error_msg': "没有找到对应的商品信息",
			});
			return;
		}
	} else {
		callback(0, {
			'error': 1002,
			'error_msg': "没有登录",
		});
		return;
	}
}

exports.getShopItemDetail = function(headers, query, callback) {
	var uid = headers['uid'];
	var shop_id = Number(query['shop_id']);
	var item_id = Number(query['item_id']);

	var shop_item_detail = ShopCache.getInstance().getShopItemDetail(uid, shop_id,
		item_id);
	if ('error' in shop_item_detail && Number(shop_item_detail['error']) != 0) {
		callback(0, shop_item_detail);
		return;
	} else {
		delete shop_item_detail['error'];

		var json_result = {
			'error': 0,
			'shop_id': shop_id,
			'item_id': item_id,
			'item_detail': shop_item_detail
		};

		callback(0, json_result);
		return;
	}



}

exports.getMyFavoritesItems = function(headers, query, callback) {

	let uid = Number(headers['uid']);
	if (uid <= 0) {
		callback(0, {
			'error': ErrorCode.USER_NO_LOGIN,
		});
		return;
	}

	let favorites_items = FavoriteService.getPlayerFavoriteItems(uid);


	var list = ShopCache.getInstance().getMyFavoritesItems(favorites_items);
	var json_result = {
		'list': list,
	};
	callback(0, json_result);
}

exports.getApkVersion = function(headers, query, callback) {

	var json_result = watchApkVersion("./down/apk/");
	//return json_result;
	callback(0, json_result);
}

exports.getMyAttention = function(headers, query, callback) {


	let uid = headers['uid'];
	let area_code = 0;
	if ('area_code' in query) {
		area_code = Number(query['area_code']);
	}
	let distance = 0;
	if ('distance' in query) {
		distance = Number(query['distance'])
	}
	let category_code = 0;
	if ('category_code' in query) {
		category_code = query['category_code'];
	}
	let start_index = 0;
	if ('page' in query) {
		start_index = Number(query['page']);
	}
	if (Number.isNaN(start_index)) {
		start_index = 0;
	}
	//var list = //PlayerCache.getInstance().getMyAttention(uid);
	let list = AttentionService.getAttentionShops(uid);

	let page_size = 20;

	logger.log("INFO", '[getMyAttention] query:', uid, area_code, distance,
		category_code, start_index);


	let attention_info_list = ShopCache.getInstance().getMyAttentionShopInfo(uid,
		list, start_index, page_size, {
			'area_code': area_code,
			'distance': distance,
			'category_code': category_code,
			'longitude': headers['longitude'],
			'latitude': headers['latitude'],
		});

	var json_result = {
		'page': start_index,
		'list': attention_info_list,
		'count': attention_info_list.length,
	};

	callback(0, json_result);
}

exports.getCategory = function(headers, query, callback) {
	let type = Number(query['type']);
	let list_result = [];
	if (type == 2) {
		list_result = DbCache.getInstance().getItemCategory();
	} else if (type == 1) {
		list_result = DbCache.getInstance().getShopCategory();
	}

	callback(0, {
		'list': list_result,
		'type': type,
	});
}


exports.getShopArea = function(headers, query, callback) {
	logger.log("HTTP_HANDER", "start getShopArea");
	var json_result = DbCache.getInstance().getShopArea();
	callback(0, json_result);

}
exports.getMyShopItemList = function(headers, query, callback) {
	//logger.log("HTTP_HANDER","start getMyShopItemList");
	var json_result = ShopCache.getInstance().getMyShopItemList(headers['uid']);
	callback(0, json_result);
}
exports.getMyShopInfo = function(headers, query, callback) {
	logger.log("HTTP_HANDER", "start getMyShopInfo uid: " + headers['uid']);

	var json_result = ShopCache.getInstance().getMyShopBasicInfo(headers['uid'],
		true);

	callback(0, json_result);
}

exports.getMyActivity = function(headers, query, callback) {
	logger.log("INFO", "start getMyActivity");

	let uid = headers['uid'];
	if (uid <= 0) {

		callback(0, {
			'error': ErrorCode.USER_NO_LOGIN,
		});
		return;
	}
	let shop_id = ShopService.getOwnShopId(uid);
	if (shop_id <= 0) {

		callback(0, {
			'error': ErrorCode.USER_NO_SHOP,
		});
		return;
	}

	ShopActivityService.getActivity(shop_id, (error, activity_bean) => {

		if (error != null) {
			logger.log("ERROR", "[getMyActivity] SQL_ERROR:", error);
			callback(0, {
				'error': ErrorCode.SQL_ERROR,
			});
			return;
		}
		if (activity_bean == null) {
			callback(0, {
				'error': 0,
			});
			return;
		} else {
			callback(0, {
				'error': 0,
				'bean': activity_bean.getJsonValue(),
			});
			return;
		}
	});



	logger.log("INFO", "end getMyActivity");
	return;
}

exports.getGameShopList = function(headers, query, callback) {
	var zone = Number(query['area_code'] || 0);
	var city = Number(query['city_no'] || 0);
	//var guid = headers['guid'];
	var uid = headers['uid']
	if (city == 0) city = 167;
	var category = Number(query['cate_code'] || 0);

	var page_size = 50;
	if ('page_size' in query) {
		page_size = Number(query['page_size'] || 10);
	}
	var search_key = "";

	var longitude = 0.0;
	if ('longitude' in headers) {
		longitude = Number(headers['longitude']);
	}
	var latitude = 0.0;
	if ('latitude' in headers) {
		latitude = Number(headers['latitude']);
	}
	var distance = -1.0;
	if ('distance' in query) {
		distance = Number(query['distance']);
	}
	let last_index = 0;

	logger.log("HTTP_HANDER", "getShopList param: category = ", category, 'city=',
		city, 'page_size=', page_size, 'search_key=,', search_key,
		'longitude=', longitude,
		'latitude=', latitude,
		'last_index=', last_index,
		'area_code=', zone
	);

	var shop_list = ShopCache.getInstance().getShopList(uid, city, zone, category,
		last_index, page_size, search_key, longitude, latitude, distance);


	var json_result = {
		"list": shop_list['list'],
		'page_size': page_size,
		'length': shop_list['list'].length,
		'total': shop_list['total'],
	}
	callback(0, json_result);
}


exports.getGameItemList = function(headers, query, callback) {

	var city_no = Number(query['city_no'] || 167);
	var area_code = Number(query['area_code'] || 0);
	var cate_code = query['category'] || '';
	var sort_code = query['sortby'] || '';
	let distance = Number(query['distance'] || "0");

	let longitude = 0.0;
	if ('longitude' in headers && !Number.isNaN(headers['longitude'])) {
		longitude = parseFloat(headers['longitude']);
	}
	let latitude = 0.0;
	if ('latitude' in headers && !Number.isNaN(headers['latitude'])) {
		latitude = parseFloat(headers['latitude']);
	}

	let last_index = 0;

	var keyword = "";

	var query_result = ShopCache.getInstance().getShopSpread(last_index,
		longitude, latitude, city_no, area_code, distance, cate_code, keyword);

	var json_value = {
		'error': 0,
		'list': query_result.slice(0, 100),
		'page_size': 100,
		'length': query_result.length,
	};

	callback(0, json_value);
}

exports.getShopAttentionBoard = function(headers, query, callback) {

	var area_code = Number(query['area_code'] || 0);
	var city = Number(query['city_no'] || 0);
	let distance = Number(query['distance']);

	var category = Number(query['cate_code'] || 0);

	let uid = headers['uid'];
	var start_index = Number(query['page'] || 0);
	var page_size = 15;
	let distance_json = {
		'distance': distance,
		'longitude': Number(headers['longitude']),
		'latitude': Number(headers['latitude']),
	};

	let attention_board = AttentionBoardService.getAttentionBoard();

	let attention_list = attention_board.slice(start_index, start_index + 15);
	let json_result = {
		'count': attention_board.length,
		'page': start_index,
		'list': [],
	};
	attention_list.forEach((shop_attention_num_info) => {
		let shop_basic_info = ShopCache.getInstance().getShopBoardInfo(
			shop_attention_num_info['shop_id'],
			city,
			area_code,
			category, distance_json);

		if (shop_basic_info != null) {
			shop_basic_info['attention_num'] = shop_attention_num_info['num'];
			json_result['list'].push(shop_basic_info);
			json_result['is_attention'] = AttentionService.isAttentionThisShop(uid,
				shop_attention_num_info['shop_id']);
		}
	});



	//var json_value = ShopCache.getInstance().getShopAttentionBoard(uid,city,area_code,category,distance_json);

	callback(0, json_result);
}

exports.getMyScheduleRouteInfo = function(headers, query, callback) {
	var guid = headers['guid'];
	//var uid = PlayerCache.getUid(guid);
	var json_result = PlayerCache.getMyScheduleRouteInfo(guid);
	//
	ShopCache.fillScheduleShopInfo(json_result);

	callback(0, json_result);
}

exports.getBeSellerData = function(headers, query, callback) {
	var json_result = {};
	let uid = Number(headers['uid']);
	if (uid > 0) {
		json_result['category'] = DbCache.getInstance().getShopCategory();
		let shop_id = ShopService.getOwnShopId(uid);
		logger.log("HTTP_HANDER", "shop_id:" + shop_id + " uid:" + headers['uid']);
		if (shop_id > 0) {
			json_result['shop_info'] = ShopCache.getInstance().getMyShopSellerInfo(
				shop_id);
		}
	}
	callback(0, json_result);

}

exports.getShopClaimState = function(headers, query, callback) {
	let shop_id = Number(query['shop_id']);
	let uid = headers['uid'];
	if (uid == 0) {
		callback(0, {
			'error': 1001,
		});
		return;
	}
	if (shop_id == 0) {
		callback(0, {
			'error': 1,
			'error_msg': '不存在商铺'
		});
		return;
	}
	let check_result = ShopService.checkCanClaim(uid, shop_id);
	if (check_result == false) {
		callback(0, {
			'error': ErrorCode.CLAIM_ERROR,
			'error_msg': '用户或商铺不满足认领条件',
		});
		return;
	}

	let json_result = ShopCache.getInstance().getShopClaimState(shop_id);
	json_result['claim'] = ShopService.getCliamPlayer(shop_id);
	callback(0, json_result);
}

exports.getAttentionGroup = function(headers, query, callback) {
	let uid = Number(headers['uid']);
	assert.equal(typeof uid, 'number', 'uid typeof require number but is string');

	let shop_id = ShopService.getOwnShopId(uid);
	if (shop_id > 0) {
		let attention_list = ShopCache.getInstance().getShopAttention();
		let result = [];
		attention_list.forEach((attention_uid) => {
			assert.equal(typeof attention_uid, 'number', 'attention_uid is a string');

			if (attention_uid != uid) {
				let playerInfo = PlayerCache.getInstance().getAttentionInfo(
					attention_uid);
				result.append(playerInfo);
			}
		});

		result.sort(() => {

		});
		callback(0, {
			'error': 0,
			'list': result,
		});
		return;
	} else {
		logger.log("ERROR", `${uid} not have shop`);
		callback(0, {
			'error': 1,
		});
	}
}

exports.getShopAttentionGroupMessageList = function(headers, query, callback) {
	let shop_id = Number(query['shop_id']);
	assert.equal(typeof shop_id, 'number', '');
	if (shop_id > 0) {
		let result = ShopCache.getInstance().getAttentionGroupMessageList();
		if (result != null) {
			callback(0, {
				'error': 0,
				'list': result,
			});
			return;
		}

	}

	callback(0, {
		'error': 1,
	});
	return;

}

exports.getSearchResult = function(headers, query, callback) {

	let searchType = Number(query['type']);
	let keyword = query['keyword'];
	logger.log("INFO", 'searchType:', searchType, 'keyword:', keyword);
	let list = ShopCache.getInstance().search(keyword, searchType);
	callback(0, {
		'list': list,
	});

}

exports.getGroupMsgHistory = function(headers, query, callback) {
	let uid = headers['uid'];
	if (uid <= 0) {
		callback(0, {
			'error': ErrorCode.USER_NO_LOGIN,
		});
		return;
	}

	let shop_id = ShopService.getOwnShopId(uid);
	if (shop_id <= 0) {
		callback(0, {
			'error': ErrorCode.USER_NO_SHOP,
		});
		return;
	}

	GroupMsgService.getShopGroupMsgList(shop_id, (list) => {
		let json_list = [];

		for (var key in list) {
			json_list.push(list[key].getJsonValue());
		}
		callback(0, {
			'error': 0,
			'list': json_list,
		});

	});

};

exports.getGroupMsgList = function(headers, query, callback) {
	let uid = headers['uid'];
	if (uid <= 0) {
		callback(0, {
			'error': ErrorCode.USER_NO_LOGIN,
		});
		return;
	}
	let shop_id = Number(query['shop_id']);
	if (shop_id <= 0) {
		callback(0, {
			'error': ErrorCode.USER_NO_SHOP,
		});
		return;
	}
	let own_shop_id = ShopService.getOwnShopId(uid);
	if (!AttentionService.isAttentionThisShop(uid, shop_id)) {
		if (own_shop_id != shop_id) {
			callback(0, {
				'error': ErrorCode.USER_NO_ATTENTION,
			});
			return;
		}

	}



	GroupMsgService.getShopGroupMsgList(shop_id, (list) => {
		let json_list = [];
		for (var key in list) {
			json_list.push(list[key].getJsonValue());
		}
		callback(0, {
			'error': 0,
			'list': json_list,
			'attention_num': AttentionService.getShopAttentionNum(shop_id),
		});
	})

	return;
};

exports.getGroupChatList = function(headers, query, callback) {

}

exports.getGroupChatList = function(headers, query, callback) {
	let shop_id = Number(query['shop_id']);
}

exports.getAllGroupList = function(headers, query, callback) {
	let shop_id = Number(query['shop_id']);

	let all_attention_users = AttentionService.getAttentionUsers(shop_id);
	let result = [];
	for (let uid of all_attention_users) {
		let player = PlayerCache.getInstance().getPlayer(uid);
		if (player != null) {
			result.push({
				'uid': uid,
				'name': player.getName(),
				'head': player.getHead(),
			});
		} else {
			result.push({
				'uid': uid,
				'name': "用户",
				'head': '',
			});
		}

	}
	callback(0, {
		'error': 0,
		'list': result,
	})
}