'use strict';

console.log("load ShopCache.js");
var util = require('util');
var logger = require('../logger').logger();
var PlayerProxy = require("../playerList");
var ShopItem = require("../bean/ShopItem");
var ShopBean = require("../bean/ShopBean");
var FindUtil = require("../FindUtil.js");
var ActivityBean = require("../bean/ActivityBean");
var events = require('events');
var ShopComment = require("../bean/ShopComment.js");

var DbCache = require("../cache/DbCache.js")
var HeadInstance = require("../HttpHeadInstance");


function ShopManager(){
	this.dict = {};
	this.item_property_name = {};
	this.shop_item_property = {};
	this.shop_items = {};
	this.show_items = [];
	this.activity_list = {};
	this.max_shop_item_id = 0;
	this.max_shop_id = 0;
	this.max_activity_id = 0;

	//events.EventEmitter.call(this);
}
//util.inherits(ShopManager, events.EventEmitter);

ShopManager.prototype.getDebugAllItemString = function(){
	return util.inspect(this.shop_items);
}

ShopManager.prototype.removeShopItem = function(param){
	let item_id = param['id'];
	if(item_id in this.shop_items){
		let itemBean = this.shop_items[item_id];
		let shop_id = itemBean.getShopId();
		delete this.shop_items[item_id];

		for(var key in this.show_items){
			if(this.show_items[key] == item_id){
				this.show_items.splice(key,1);
				break;
			}
		}
		if(shop_id in this.dict){
			let shopBean = this.dict[shop_id];
			shopBean.removeShopItem(item_id);
		}
	}
	
	return null;
}

ShopManager.prototype.saveShopItem = function(json_item,json_image,json_propertys){

	let item_id = Number(json_item['id']);
	let shop_id = Number(json_item['shop_id']);
	
	logger.log("INFO","[ShopCache][addShopItem]"
		,'json_item:',util.inspect(json_item)
		,'json_image:',util.inspect(json_image));

	if(!(shop_id in this.dict)){
		logger.log("WARN","[ShopCache][addShopItem]"
			,'shop_id:',shop_id);
		return {
			'error':2,
			'error_msg' :'添加物品时,指定的商铺不存在',
		};
	}

	if(item_id in this.shop_items){

		let itemBean = this.getItemBean(item_id);

		this.refreshShopItem(itemBean,json_item,json_image,json_propertys);
		
		HeadInstance.getInstance().emit("/get_my_shop_item_detail",item_id);

	}else{
		logger.log("WARN","[ShopCache][saveShopItem]"
			,'item_id',item_id
			,'this.shop_items:',util.inspect(this.shop_items[item_id]));
		return {
			'error':2,
			'error_msg' :'更新物品时,物品不存在',
		};
	}
}

ShopManager.prototype.refreshShopItem = function(itemBean,json_value,json_image,json_propertys){

	itemBean.initFromDb(json_value);

	if(itemBean.isSpreadItem()){
		let find_shop_item_in_spraed_list = false;
		for(var key in this.show_items){
			if(this.show_items[key] == itemBean.getId()){
				find_shop_item_in_spraed_list = true;
				break;
			}
		}
		if(!find_shop_item_in_spraed_list){
			this.show_items.push(itemBean.getId());
		}
	}

	if(json_image != null){
		for(var key in json_image){

			let result = itemBean.updateImage(json_image[key]);
			if(!result){
				logger.log("WARN",'[ShopManager][refreshShopItem]'
					,'result:',result
					,'key:',key
					,'json_image[key]:',json_image[key]);
			}
		}
	}
	if(json_propertys != null && json_propertys != undefined){
		
		for(var key in json_propertys){
			itemBean.updateProperty(json_propertys[key]);
		}
	}
}

ShopManager.prototype.addShopItem= function(json_value,json_image,json_propertys){

	let item_id = Number(json_value['id']);
	let shop_id = json_value['shop_id'];

	logger.log("INFO","[ShopCache][addShopItem]"
		,'json_value:',util.inspect(json_value)
		,'json_image:',util.inspect(json_image));

	if(!(item_id in this.shop_items)){

		if(!(shop_id in this.dict)){
			logger.log("WARN","[ShopCache][addShopItem]"
				,'shop_id:',shop_id);
			return {
				'error':2,
				'error_msg' :'添加物品时,指定的商铺不存在',
			};
		}

		let itemBean = new ShopItem();

		this.refreshShopItem(itemBean,json_value,json_image,json_propertys);
		this.shop_items[item_id] = itemBean;
		
		let shopBean = this.dict[shop_id];
		shopBean.addItemToShop(item_id);
		HeadInstance.getInstance().emit("/get_my_shop_item_detail",item_id);
	}else{
		logger.log("WARN","[ShopCache][addShopItem]"
			,'item_id',item_id
			,'this.shop_items:',util.inspect(this.shop_items[item_id]));
		return {
			'error':2,
			'error_msg' :'添加物品时,已经有重复ID',
		};
	}
}

let g_shop_cache = new ShopManager();

exports.getInstance = function(){
	return g_shop_cache;
}

exports.InitFromDb = function(
	shop_list,
	shop_comment,
	shop_item,
	shop_item_property,
	shop_attention,
	activity_list,
	shop_item_attention,
	shop_item_images,
	shop_claims){
	
	g_shop_cache['dict'] = {};
	g_shop_cache['max_shop_id'] = 0;

	for(var i in shop_list){
		var shop_id = parseInt(shop_list[i]['Id']);
		
		g_shop_cache['dict'][shop_id] = new ShopBean();

		g_shop_cache['dict'][shop_id].initFromDbRow(shop_list[i]);
		let uid = Number(shop_list[i]['uid']);
		let state = Number(shop_list[i]['state']);
		if(state == 0 || state == 1){
			PlayerProxy.getInstance().SetUserShopId(uid,shop_id,state);
		}
		

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

	for(var i in shop_item_property){

		var item_id = Number(shop_item_property[i]['item_id']);
		if(item_id in g_shop_cache['shop_items']){
			g_shop_cache['shop_items'][item_id].addItemProperty(shop_item_property[i]);
		}
	}
	logger.log("INFO",shop_attention);
	for(var i in shop_attention){
		var shop_id = shop_attention[i]['shop_id'];
		if(shop_id in g_shop_cache['dict']){
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
	//logger.log("SHOP_CACHE",util.inspect(shop_item_images));

	for(var i in shop_item_images){
		var item_id = Number(shop_item_images[i]['item_id']);
		var image = shop_item_images[i]['image'];
		var index = shop_item_images[i]['index'];
		var image_type = Number(shop_item_images[i]['image_type']);

		if(item_id in g_shop_cache['shop_items']){
			if(image_type == 1){
				g_shop_cache['shop_items'][item_id].addItemShowImage(image);
			}else if(image_type == 2){
				g_shop_cache['shop_items'][item_id].setSpreadImage(image);
			}else if(image_type == 3){
				g_shop_cache['shop_items'][item_id].addItemDetailImage(image);
			}
			
		}else{
			logger.warn("SHOP_CACHE","can't find item_id in g_shop_cache['shop_items'] item_id= " + item_id);
		}
	}

	for(var i in shop_claims){
		let uid = Number(shop_claims[i]['uid']);
		let shop_id = Number(shop_claims[i]['shop_id']);
		if(shop_id in g_shop_cache['dict']){
			g_shop_cache['dict'][shop_id].setClaim(uid);
		}
		
	}

}

ShopManager.prototype.getShopList = function(uid,city_no,area_code,category,last_distance,page_size,search_key,longitude,latitude,distance){
	var all_list = [];
	console.log("last_distance:" + last_distance)
	for(var i in g_shop_cache['dict']){

		var shop_info = g_shop_cache['dict'][i];
		var dis = shop_info.calcDistance(longitude,latitude);
		//console.log("dis:" + dis)
		if(dis > last_distance){
			if(distance <= 0 || dis < distance){
				if(shop_info && shop_info.matchFilter(city_no,area_code,category)){
					if(search_key.length > 0){
						if(shop_info.search(search_key)){
							all_list.push(shop_info.getShopBasicInfo(uid,longitude,latitude));
						}
					}else{
						all_list.push(shop_info.getShopBasicInfo(uid,longitude,latitude));
					}

				}
			}
		}
		
	}
	all_list.sort(function(a,b){
		return a['distance'] - b['distance'];
	});
	

	if(all_list.length == 0){
		return {
			'list' : [],
			'last_distance' :  last_distance,
		};
	}else{
		var list = all_list.slice(0,page_size);
		return {
			'list': list,
			'last_distance' :  list[list.length - 1]['distance'],
		};
	}

	
}




exports.GetNearShopList = function(type,long,late,page,size){

	return [];

}

exports.getShopDetail = function(uid,shop_id){
	
	var shop_info = g_shop_cache['dict'][shop_id];
	if(shop_info == null){
		return {
			'error' : 1,
			'error_msg' : '找不到对应的商铺信息'
		};
	}

	var shop_item_list = shop_info.getItems();

	var json_result = {
		'error' : 0,
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

ShopManager.prototype.getShop = function(shop_id){
	if(shop_id in this.dict){
		return this.dict[shop_id];
	}
	return null;
}

ShopManager.prototype.getItemBean = function(item_id){
	if(item_id in this.shop_items){
		return this.shop_items[item_id];
	}
	return null;
}


ShopManager.prototype.getMyShopItemDetail = function(uid,shop_id,item_id){
	
	if(shop_id > 0){
		let shop_item = this.getItemBean(item_id);
		if(shop_item == null){
			return null;
		}
		let result = shop_item.getDetailJsonItemInMyShop();
		result['shop_id'] = shop_id;
		return result;
	}else{
		return null;
	}
}

ShopManager.prototype.getShopItemDetail = function(uid,shop_id,shop_item_id) {
	logger.log("SHOP_CACHE","[getShopItemDetail] params:[ uid:" + uid+ ",shop_id:" + shop_id + ",shop_item_id:" + shop_item_id + "]");
	var shop_item_detail = {};
	shop_item_detail['error'] = 0;

	var shop_info = this.getShop(shop_id);
	
	if(shop_info != null){
		var shop_item = this.getItemBean(shop_item_id);
		if(shop_item != null){
			shop_item_detail = shop_item.getDetailJsonItem();
			shop_item_detail['error'] = 0;
		}
	}else{
		shop_item_detail['error'] = 0;
		shop_item_detail['error_msg'] = "不存在这个商铺";
	}
	logger.log("SHOP_CACHE","[getShopItemDetail] return:[" +  util.inspect(shop_item_detail,{depth:null}) + "]");
	
	return shop_item_detail;
}



ShopManager.prototype.getShopSpread = function(last_distance,longitude,latitude,city_no,area_code,distance,category_code,keyword){
	var arr_result = [];
	//logger.log("INFO","[ShopManager][getShopSpread] this.show_items:",this.show_items);
	for(var i in this.show_items){
		var item_id = this.show_items[i];

		var shop_item = this.getItemBean(item_id);
		
		if(shop_item != null){
			if(shop_item.isSpreadItem() && shop_item.matchFilter(keyword)){
				let item_category = shop_item.getCategoryCode();
				//console.log("item_category",util.inspect(item_category));
				let matchCategory = DbCache.getInstance().matchCategor(category_code,item_category,"item");
				if(!matchCategory){
					continue;
				}
				//logger.log("INFO",'matchCategory:',matchCategory);
				var shop_id = shop_item['shop_id'];

				var shop_info = this.getShop(shop_id);
				if(shop_info != null){
					var dis = shop_info.calcDistance(longitude,latitude);
					logger.log("INFO","dis:" + dis );
					if(dis > last_distance){
						if(distance <= 0 || dis < distance){
							if(shop_info.matchFilter(city_no,area_code,0)){
								arr_result.push(shop_item.getSpreadItemInfo(dis));
							}
						}
						
					}
				}
			}
			
		}
	}

	if(arr_result.length > 0){

		arr_result.sort(function(left,right){
			return left['distance'] - right['distance'];
		});
		var page_size = 30;
		let arr_list = arr_result.slice(0,page_size);
		return {
			'list': arr_list,
			'page_size' : page_size,
			'last_distance' : arr_list[arr_list.length - 1]['distance'],
		};

	}else{
		return {
			'list' : [],
			'last_distance' : last_distance,
		}
	}

	
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
				favorites_item['add_favorites_time'] = items[i]['add_favorites_time'];
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

ShopManager.prototype.getMyAttentionShopInfo = function(shop_id_list){
	var list = [];

	for(var i in shop_id_list){
		var shop_id = shop_id_list[i]['shop_id'];
		var shop_info = this.getShop(shop_id);
		if(shop_info != null){
			list.push(shop_info.getShopAttentionInfo());
		}
	}
	
	return list;
}





ShopManager.prototype.InsertBecomeSeller = function(uid,shop_info){

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

ShopManager.prototype.addAttention = function(uid,shop_id,is_attention){

	var shop_info = this.getShop(shop_id);
	if(shop_info != null){
		if(is_attention){
			shop_info.addAttention(uid);
		}else{
			shop_info.cancelAttention(uid);
		}
	}
}

ShopManager.prototype.getShopAttentionInfo = function(shop_id){
	let shop_info = this.getShop(shop_id);
	if(shop_info != null){
		return {
			'attention_num' : shop_info.getAttentionNum(),
		}
	}else{
		return {
			'attention_num' : 0,
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

exports.addShopItem = function(shop_id,name,price,show_price,image){

	
	if(!shop_id in g_shop_cache['dict']){
		logger.error("SHOP_CACHE","can't find shop in g_shop_cache['dict'] shop_id:" + shop_id);
		return 0;
	}

	var shop_item = new ShopItem();
	var item_id = g_shop_cache['max_shop_item_id'] + 1;
	g_shop_cache['max_shop_item_id'] = g_shop_cache['max_shop_item_id'] + 1;

	shop_item.newShopItem(item_id,shop_id,image,name,price,show_price);

	g_shop_cache['shop_items'][item_id] = shop_item;

	g_shop_cache['dict'][shop_id].addItemToShop(item_id);
	return g_shop_cache['shop_items'][item_id].getJsonValue();
}

ShopManager.prototype.getMyShopBasicInfo = function(uid,withItem){
	var shop_id = PlayerProxy.getInstance().getMyShopId(uid);
	
	if(shop_id > 0){
		let shop_info = this.getShop(shop_id);
		if(shop_info != null){
			var json_result = shop_info.getMyShopBasicInfo();
			json_result['shop_items'] = [];
			var shop_item_list = shop_info.getItems();

			for(var i in shop_item_list){
				var shop_item_id = shop_item_list[i];
				var shop_item = this.getItemBean(shop_item_id);
				json_result['shop_items'].push(shop_item.getItemBasicInfo());
			}
			return json_result;
		}
	}

	return {
		'error' : 1,
		'error_msg' : '找不到对应的商铺信息',
	};
}


ShopManager.prototype.getMyShopItemInfo = function(shop_item_id){
	if(shop_item_id in this.shop_items){
		var shop_item_info = this.getItemBean(shop_item_id);
		if(shop_item_info != null){
			return shop_item_info.getMyShopItemInfo();
		}else{
			logger.error("SHOP_CACHE","Find shop item error with itemid = "+ shop_item_id);
		}
	}
	
	return null;
}


ShopManager.prototype.getMyShopItemList = function(uid){
	var shop_id = PlayerProxy.getInstance().getMyShopId(uid);
	var json_result = {
		'list':[]
	};
	
	if(shop_id > 0){
		var shop_info = this.getShop(shop_id);
		if(shop_info != null){
			var shop_items = shop_info.getItems();

			if(shop_items != null){
				for(var shop_item_key in shop_items){

					var shop_item_id = shop_items[shop_item_key];
					let shop_item_info = this.getMyShopItemInfo(shop_item_id);
					if(shop_item_info != null){
						json_result['list'].push(shop_item_info)
					}
					
					
				}
				//logger.log("SHOP_CACHE",util.inspect(json_result['list']));
			}
		}
		
	}
	return json_result;
}

ShopManager.prototype.saveShopBasicInfo = function(shop_id,db_row){
	
	if(shop_id > 0){
		var shop_info = this.getShop(shop_id);
		if(shop_info != null){
			shop_info.changeShopBasicInfo(db_row['image'],db_row['address'],db_row['telephone']);
		}
	}
	
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

ShopManager.prototype.updateSellerInfo = function(db_row){
	let shop_id = db_row['id'];
	
	var shop_info = this.getShop(shop_id);
	if(shop_info != null){
		return shop_info.updateSellerInfo(db_row);
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
				list.push(shop_info.getShopBasicInfo(uid));
			}
		}
	}
	list.sort(function(){ return 0.5 - Math.random();});
	return list.slice(0,page_size);
}

exports.getShopAttentionBoard = function(uid,city,area_code,category_code,search_key){

	var list = [];

	for(var key in g_shop_cache['dict']){
		var shop_info = g_shop_cache['dict'][key];
		if(shop_info != null){
			if(shop_info.matchFilter(city,area_code,category_code)){
				if(search_key.length > 0){
					if(shop_info.search(search_key)){
						list.push(shop_info.getShopBoardInfo());
					}
				}else{
					list.push(shop_info.getShopBoardInfo());
				}
			}
		}
	}

	return list.sort(function(a,b){
		return b['attention_num'] - a['attention_num']
	});
}
exports.fillScheduleShopInfo = function(json_value){
	
	for(var i in json_value['list']){
		var schedule_info = json_value['list'][i];
		
		for(var j in schedule_info['schedule_info']){
			var shop_id = schedule_info['schedule_info'][j]['shop_id'];
			
			var shop_info = g_shop_cache['dict'][shop_id];
			if(shop_info != null){
				schedule_info['schedule_info'][j]['shop_info'] = shop_info.getSheduleInfo();
			}
		}
	}	
}

exports.getShopScheduleInfo = function(shop_id){
	var shop_info = g_shop_cache['dict'][shop_id];
	if(shop_info != null){
		return shop_info.getSheduleInfo();
	}
}

exports.addFavoritesUser = function(shop_id,item_id,uid){
	if(item_id in g_shop_cache['shop_items']){
		g_shop_cache['shop_items'][item_id].addAttention(uid);
	}
}	

exports.setShopItemImage = function(item_id,index,image){
	if(item_id in g_shop_cache['shop_items']){
		g_shop_cache['shop_items'][item_id].setItemImage(index,image);

		return {
			'item_id' : item_id,
			'index' : index,
			'image' : image
		};
	}

	return null;
}

exports.removeShopByShopId = function(shop_id){
	if(shop_id in g_shop_cache['dict']){
		delete g_shop_cache['dict'][shop_id];

		return null;
	}

	return {
		'error' : 10005,
		'error_msg' : '删除不存在的商铺',
	};

}


exports.ModifyShopByShopId = function(isAdd,shop_id,shopParams){
	if(isAdd){
		if(shop_id in g_shop_cache['dict']){
			return {
				'error' : 10003,
				'error_msg' : '添加商铺时有重复id'
			};
		}
		let shopBean = new ShopBean();
		shopBean.initFromDbRow(shopParams);
		g_shop_cache['dict'][shop_id] = shopBean;
		logger.log("SHOP_CACHE","all_list:" + util.inspect(g_shop_cache['dict']));
	}else{
		if(shop_id in g_shop_cache['dict']){
			let shopBean = g_shop_cache['dict'][shop_id];
			shopBean.initFromDbRow(shopParams);
		}else{
			return {
				'error':10004,
				'error_msg':'修改商铺时,指定的商铺id不存在',
			};
		}
	}
}

ShopManager.prototype.getMyShopSellerInfo = function(shop_id){
	let shopBean = this.getShop(shop_id);
	if(shopBean != null){
		return shopBean.getSellerInfo();
	}
	return {};
}

ShopManager.prototype.chekcCanClaim = function(shop_id){
	let shopBean = this.getShop(shop_id);
	if(shopBean == null){
		return false;
	}
	if(shopBean.getShopState() != 2){
		return false;
	}
	if(shopBean.getClaim() != 0){
		return false;
	}
	return true;
}

ShopManager.prototype.setClaimShop = function(uid,shop_id){
	let shopBean = this.getShop(shop_id);
	if(shopBean != null){
		shopBean.setClaim(uid);
	}
}

ShopManager.prototype.getShopClaimState = function(shop_id){
	let shopBean = this.getShop(shop_id);
	if(shopBean == null){
		return {
			'error_msg' : '没有找到商铺',
			'error' : 1,
		};
	}
	let json_result = shopBean.getClaimState();
	if(json_result['shop_state'] != 2){
		return {
			'error_msg' :  '商铺不能认领',
			'error' : 2,
		};
	}
	if(json_result['claim'] != 0){
		return {
			'error_msg' :  '商铺已经被其他人认领',
			'error' : 2,
		};
	}
	json_result['area_name'] = DbCache.getInstance().getAreaName(json_result['city_no'],json_result['area_code']);
	return json_result;
}

ShopManager.prototype.addShop = function(db_row){
	let TAG = "[ShopManager][addShop]";
	var shop_id = Number(db_row['Id']);
	if(shop_id in this.dict){
		logger.log("WARN",TAG,'error_msg:',shop_id,'is in this.dict');
		return {
			'error' : 1,
			'error_msg' : `${shop_id} is find in this.dict`,
		};
	}
	this.dict[shop_id] = new ShopBean();

	this.dict[shop_id].initFromDbRow(db_row);

	let uid = Number(shop_list[i]['uid']);
	let state = Number(shop_list[i]['state']);
	if(state == 0 || state == 1){
		PlayerProxy.getInstance().SetUserShopId(uid,shop_id,state);
	}

	this.max_shop_id = Math.max(shop_id,g_shop_cache['max_shop_id']);
	return null;
}