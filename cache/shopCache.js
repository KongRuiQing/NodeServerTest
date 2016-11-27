
var util = require('util');
var logger = require('../logger').logger();
var PlayerProxy = require("../playerList");
var ShopItem = require("../bean/ShopItem");
var ShopBean = require("../bean/ShopBean");
var FindUtil = require("../FindUtil.js");
var ActivityBean = require("../bean/ActivityBean");

var ShopComment = require("../bean/ShopComment.js");

g_shop_cache = {
	'dict' : {},
	'item_property_name' : {},
	'shop_item_property' : {},
	'shop_items' : {},
	'show_items' : [],
	'activity_list' : {},
	'max_shop_item_id' : 0,
	'max_shop_id' : 0,
	'max_activity_id' : 0
};

//create shop  return this;
// this.getShopBasicinfo;
// this.getShopDetailInfo;



exports.InitFromDb = function(
	shop_list,
	shop_comment,
	shop_item,
	shop_item_property,
	shop_item_property_config,
	shop_attention,
	activity_list,
	shop_item_attention){
	
	g_shop_cache['dict'] = {};
	g_shop_cache['max_shop_id'] = 0;

	for(var i in shop_list){
		var shop_id = parseInt(shop_list[i]['Id']);
		
		g_shop_cache['dict'][shop_id] = new ShopBean();

		g_shop_cache['dict'][shop_id].initFromDbRow(shop_list[i]);
		
		g_shop_cache['max_shop_id'] = Math.max(parseInt(shop_id),g_shop_cache['max_shop_id']);
	}

	for(var i in shop_comment){
		var shop_id = shop_comment[i]['shop_id'];
		var shop_info = g_shop_cache['dict'][shop_id];
		if(shop_info != null){
			var comment = new ShopComment();
			comment.initFromDbRow(shop_comment[i]);
			shop_info.addComment(comment);
		}
		
	}

	for(var i in shop_item){

		var item = shop_item[i];
		var shop_id = item['shop_id'];

		var shop_info = g_shop_cache['dict'][shop_id];
		
		if(shop_info != null){

			var item_id = Number(item['id']);
			shop_info.addItemToShop(item_id);
			
			g_shop_cache['shop_items'][item_id] = new ShopItem();
			//logger.log("SHOP_CACHE","[init][shopitem]:" + util.inspect(shop_item[i]))
			g_shop_cache['shop_items'][item_id].initFromDb(shop_item[i]);

			if(g_shop_cache['shop_items'][item_id].isSpreadItem()){
				g_shop_cache['show_items'].push(item['id']);
			}
			
			g_shop_cache['max_shop_item_id'] = Math.max(g_shop_cache['max_shop_item_id'],parseInt(item['id']));
		}

	}

	//logger.log("SHOP_CACHE","max_shop_item_id:" + g_shop_cache['max_shop_item_id']);

	for(var i in shop_item_attention){
		var item_id = shop_item_attention[i]['item_id'];
		var uid = shop_item_attention[i]['uid'];
		g_shop_cache['shop_items'][item_id].addAttention(uid);
	}

	

	for(var i in shop_item_property_config){
		g_shop_cache['item_property_name'][shop_item_property_config[i]['property_type']] = {
			'name':shop_item_property_config[i]['property_name'],
			'category' : shop_item_property_config[i]['category']
		}
	}
	

	for(var i in shop_item_property){

		var item_id = Number(shop_item_property[i]['item_id']);
		if(item_id in g_shop_cache['shop_items']){
			g_shop_cache['shop_items'][item_id].addItemProperty(shop_item_property[i]);
		}
	}

	for(var i in shop_attention){
		var shop_id = shop_attention[i]['shop_id'];
		if(g_shop_cache['dict'][shop_id] != null){
			g_shop_cache['dict'][shop_id].addAttention(shop_attention[i]['uid']);
		}
		
	}

	for(var i in activity_list){
		var activity_bean = new ActivityBean();
		activity_bean.initFromDb(activity_list[i]);

		g_shop_cache['activity_list'][activity_bean.getShopId()] = activity_bean;
		g_shop_cache['max_activity_id'] = Math.max(g_shop_cache['max_activity_id'],activity_bean.getId());
		//logger.log("SHOP_CACHE",util.inspect(g_shop_cache['activity_list']));
	}

}

exports.getShopList = function(uid,city_no,area_code,category,page,page_size){
	var all_list = [];
	
	for(var i in g_shop_cache['dict']){

		var shop_info = g_shop_cache['dict'][i];

		if(shop_info && shop_info.matchFilter(city_no,area_code,category)){
			all_list.push(shop_info.getShopBasicInfo(uid));
		}
	}
	
	if(page * page_size >= all_list.length){
		return {
			'list':all_list.slice((page - 1) * page_size),
			'count' : all_list.length
		};
	}else{
		return {
			'list':all_list.slice((page - 1) * page_size, page * page_size),
			'count' : all_list.length
		};
	}
}




exports.GetNearShopList = function(type,long,late,page,size){

	return [];

}

exports.getShopDetail = function(uid,shop_id){
	
	var shop_info = g_shop_cache['dict'][shop_id];
	if(shop_info == null){
		return null;
	}

	var shop_item_list = shop_info.getItems();

	var json_result = {
		"shop_id" : shop_id,
		"shop_info" : shop_info.getShopDetailInfo(uid)
	};

	if(shop_item_list != null){
		for(var i in shop_item_list){
			var shop_item_id = shop_item_list[i];
			var shop_item = g_shop_cache['shop_items'][shop_item_id];
			if(shop_item.isSpreadItem()){
				json_result['shop_info']['shop_item'].push(shop_item.getItemBasicInfo());
			}
		}
	}

	return json_result;
}

exports.getShopItemDetail = function(uid,shop_id,shop_item_id) {
	var shop_item_detail = {};
	shop_item_detail['error'] = 2;

	var shop_info = g_shop_cache['dict'][shop_id];
	
	if(shop_info != null){
		var shop_item = g_shop_cache['shop_items'][shop_item_id];
		
		if(shop_item != null){
			shop_item_detail = shop_item.getDetailJsonItem();
			shop_item_detail['error'] = 0;

			return shop_item_detail;
		}
	}
	
	return shop_item_detail;
}

exports.getShopSpread = function(city_no,area_code,category_code,keyword,page){
	var arr_result = [];
	var shop_spread_list = g_shop_cache['show_items'];

	for(var i in shop_spread_list){
		var item_id = shop_spread_list[i];

		var shop_item = g_shop_cache['shop_items'][item_id];
		
		if(shop_item != null){
			var shop_id = shop_item['shop_id'];
			var shop_info = g_shop_cache['dict'][shop_id];

			if(shop_info != null && shop_info.matchFilter(city_no,area_code,category_code)){

				if(shop_item.isSpreadItem() && shop_item.matchFilter(keyword)){
					arr_result.push(shop_item.getItemBasicInfo());
					arr_result.push(shop_item.getItemBasicInfo());
					arr_result.push(shop_item.getItemBasicInfo());
					arr_result.push(shop_item.getItemBasicInfo());
					arr_result.push(shop_item.getItemBasicInfo());
					arr_result.push(shop_item.getItemBasicInfo());
					arr_result.push(shop_item.getItemBasicInfo());
					arr_result.push(shop_item.getItemBasicInfo());
					arr_result.push(shop_item.getItemBasicInfo());
					arr_result.push(shop_item.getItemBasicInfo());
				}
			}
		}
	}

	var page_size = 10;
	
	return arr_result.slice((page - 1 ) * page_size ,page * page_size);
}


exports.getMyFavoritesItems = function(items){
	var item_list = [];
	//logger.log("SHOP_CACHE",util.inspect(items));
	for(var i in items){
		var item_id = items[i]['item_id'];
		
		var shop_item = g_shop_cache['shop_items'][item_id];
		//logger.log("SHOP_CACHE",util.inspect(shop_item));
		if(shop_item != null){
			var shop_id = shop_item['shop_id'];
			var shop = g_shop_cache['dict'][shop_id];

			if(shop != null){
				var shop_basic_info = shop.getShopBasicInfo(0);
				var favorites_item = shop_item.getFavoritesItemJsonValue();
				favorites_item['add_favorites_time'] = items[i]['add_time'];
				favorites_item['id'] = item_id;
				favorites_item['shop_id'] = shop_id;
				favorites_item['shop_name'] = shop_basic_info['shop_name'];
				item_list.push(favorites_item);
			}
		}
	}
	//logger.log("SHOP_CACHE",util.inspect(item_list));
	
	return item_list;
}

exports.getMyAttentionShopInfo = function(shop_id_list){
	var list = [];

	for(var i in shop_id_list){
		var shop_id = shop_id_list[i]['shop_id'];
		var shop_info = g_shop_cache['dict'][shop_id];
		if(shop_info != null){
			list.push(shop_info.getShopAttentionInfo());
		}
	}
	//logger.log("SHOP_CACHE",util.inspect(list));
	return list;
}





exports.InsertBecomeSeller = function(uid,shop_info){

	var shop_id = g_shop_cache['max_shop_id'] + 1;
	g_shop_cache['max_shop_id'] = shop_id;
	shop_info['id'] = shop_id;
	g_shop_cache['dict'][shop_id] = new ShopBean();
	g_shop_cache['dict'][shop_id].newShopBean(shop_info);
	//logger.log('SHOP_CACHE','new Shop bean:' + util.inspect(g_shop_cache['dict'][shop_id]));
	
	return g_shop_cache['dict'][shop_id].getMyShopInfo();
}


exports.getShopActivityList = function(page,page_size){

	var list = [];

	for(var key in g_shop_cache['activity_list']){
		list.push(g_shop_cache['activity_list'][key].getJsonValue());
	}

	
	
	return {
		'page' : page,
		'total':list.length,
		'list' : list.slice((page - 1) * page_size,page * page_size)
	};
}

exports.attentionShop = function(uid,shop_id){

	var shop_info = g_shop_cache['dict'][shop_id];
	if(shop_info != null){
		if(!shop_info.ownAttention(uid)){
			shop_info.addAttention(uid);
		}
		return shop_info.getShopAttentionInfo();
	}

	return null;
}

exports.cancelAttentionShop = function(uid,shop_id){
	var shop_info = g_shop_cache['dict'][shop_id];
	if(shop_info != null){
		if(shop_info.ownAttention(uid)){
			shop_info.cancelAttention(uid);
		}
	}
}

exports.CheckHasItem = function(shop_id,item_id){
	var shop_info = g_shop_cache['dict'][shop_id];	
	if(shop_info != null && shop_info.hasItem(item_id)){
		return true;
	}
	return false;
}

exports.FindShopInfo = function(shop_id){
	if(shop_id in g_shop_cache['dict']){
		return{
			'state' : g_shop_cache['dict'][shop_id].getShopState()
		}
		
	}
	return null;
}

exports.addShopItem = function(shop_id,name,price,show_price,image,image1,image2,image3,image4){

	
	if(!shop_id in g_shop_cache['dict']){
		logger.error("SHOP_CACHE","can't find shop in g_shop_cache['dict'] shop_id:" + shop_id);
		return 0;
	}

	var shop_item = new ShopItem();
	var item_id = g_shop_cache['max_shop_item_id'] + 1;
	g_shop_cache['max_shop_item_id'] = g_shop_cache['max_shop_item_id'] + 1;

	shop_item.newShopItem(item_id,shop_id,[image1,image2,image3,image4],name,price,show_price);

	g_shop_cache['shop_items'][item_id] = shop_item;

	g_shop_cache['dict'][shop_id].addItemToShop(item_id);
	return g_shop_cache['shop_items'][item_id].getMyShopItemInfo();
}


exports.getMyShopInfo = function(guid){

	var shop_id = PlayerProxy.getShopId(guid);
	
	if(shop_id > 0){
		var shop_info = g_shop_cache['dict'][shop_id];
		
		var json_result = shop_info.getMyShopInfo();

		var shop_item_list = shop_info.getItems();

		for(var i in shop_item_list){
			var shop_item_id = shop_item_list[i];
			var shop_item = g_shop_cache['shop_items'][shop_item_id];
			json_result['shop_item'].push(shop_item.getItemBasicInfo());
		}
		//logger.log("SHOP_CACHE",util.inspect(json_result));
		return json_result;
	}
	return {};
}

exports.getMyShopItemList = function(guid){
	var shop_id = PlayerProxy.getShopId(guid);
	var json_result = {
		'list':[]
	};
	//logger.log("SHOP_CACHE","[getMyShopItemList] shop_id : " + shop_id);
	if(shop_id > 0){
		var shop_info = g_shop_cache['dict'][shop_id];
		if(shop_info != null){
			var shop_items = shop_info.getItems();

			if(shop_items != null){
				for(var shop_item_key in shop_items){

					var shop_item_id = shop_items[shop_item_key];

					if(shop_item_id in g_shop_cache['shop_items']){
						var shop_item_info = g_shop_cache['shop_items'][shop_item_id];
						if(shop_item_info != null){
							var my_shop_item_info = shop_item_info.getMyShopItemInfo();
							//logger.log("SHOP_CACHE","my_shop_item_info:" + util.inspect(my_shop_item_info));
							json_result['list'].push(my_shop_item_info);
						}else{
							logger.error("SHOP_CACHE","Find shop item error with itemid = "+ shop_item_id);
						}

					}
				}
				//logger.log("SHOP_CACHE",util.inspect(json_result['list']));
			}
		}
		
	}

	return json_result;
}

exports.saveShopBasicInfo = function(guid,image,address,telephone){
	var shop_id = PlayerProxy.getShopId(guid);
	if(shop_id > 0){
		var shop_info = g_shop_cache['dict'][shop_id];
		if(shop_info != null){
			shop_info.changeShopBasicInfo(image,address,telephone);

			return shop_info.getMyShopBasicInfo();
		}
	}
	return null;
}

exports.addShopSpreadItem = function(guid,item,image,months){
	var shop_id = PlayerProxy.getShopId(guid);
	if(shop_id > 0){
		var shop_info = g_shop_cache['dict'][shop_id];
		if(shop_info != null){
			var json_result = shop_info.addShopSpreadItem(item,image,months);

			return json_result;
		}
	}
	return null;
}

exports.addShopActivity = function(guid,name,discard,image){
	var shop_id = PlayerProxy.getShopId(guid);
	if(shop_id > 0){
		var shop_info = g_shop_cache['dict'][shop_id];
		var activity_bean = g_shop_cache['activity_list'][shop_id];
		if(shop_info != null && activity_bean != null){

			activity_bean.setActivityInfo(name,discard,image);
			
			return activity_bean.getJsonValue();
		}
	}

	return {};
}

exports.getMyActivity = function(json_value){
	
	var activity_bean = g_shop_cache['activity_list'][json_value['shop_id']];
	if(activity_bean != null && !activity_bean.isExpireTime()){
		return activity_bean.getJsonValue();
	}

	return {};
}

exports.renewalActivity = function(json_value){
	var activity_bean = g_shop_cache['activity_list'][json_value['shop_id']];
	if(activity_bean == null){
		activity_bean = new ActivityBean();
		g_shop_cache['max_activity_id'] = g_shop_cache['max_activity_id'] + 1;
		activity_bean.newActivityBean(g_shop_cache['max_activity_id'],json_value['shop_id'],json_value['uid']);
		activity_bean.setExpireTime(json_value['num']);
		g_shop_cache['activity_list'][json_value['shop_id']] = activity_bean;
	}else if(activity_bean.isExpireTime()){
		activity_bean.setExpireTime(json_value['num']);
	} else{
		activity_bean.addExpireTime(json_value['num']);
	}

	return activity_bean.getJsonValue();
}

exports.saveShopDetail = function(json_value){
	//logger.log("SHOP_CACHE","json_value:" + util.inspect(json_value));

	var shop_info = g_shop_cache['dict'][json_value['id']];
	if(shop_info != null){
		return shop_info.saveShopDetail(json_value);
	}
	return null;
}

exports.saveShopItem = function(json_value){
	//logger.log("SHOP_CACHE","[saveShopItem][param]:" + util.inspect(json_value));

	var shop_info = g_shop_cache['dict'][json_value['shop_id']];

	if(shop_info == null){
		logger.log("SHOP_CACHE","[saveShopItem][error]:" + "no find shop");
		return null;
	}

	if(!shop_info.containsItem(json_value['id'])){
		logger.log("SHOP_CACHE","[saveShopItem][error]:" + "no find item id in shop id:" + json_value['id']);
		return null;
	}

	var shop_item_info = g_shop_cache['shop_items'][json_value['id']];

	if(shop_item_info != null){
		var result = shop_item_info.saveShopItem(json_value);

		if(result === true){
			return shop_item_info.getMyShopItemInfo();
		}
	}

	return null;
}

exports.getMyShopItemDbParams = function(item_id){
	var shop_item_info = g_shop_cache['shop_items'][item_id];

	if(shop_item_info != null){
		//logger.log("SHOP_CACHE", "[getMyShopItemDbParams]:" + util.inspect(shop_item_info.getDbParams()));
		return shop_item_info.getDbParams();
	}
	return null;
}

exports.getGameShopList = function(uid,city,area_code,category_code,page_size)
{
	var list = [];
	for(var key in g_shop_cache['dict']){
		var shop_info =g_shop_cache['dict'][key];
		if(shop_info != null){
			if(shop_info.matchFilter(city,area_code,category_code)){
				list.push(shop_info.getShopBasicinfo());
			}
		}
	}
	list.sort(function(){ return 0.5 - Math.random();});
	return list.slice(0,page_size);
}