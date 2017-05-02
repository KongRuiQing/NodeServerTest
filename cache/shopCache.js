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
let TAG = "[ShopCache]"

const INIT_SHOP_STATE = 0;
const PASS_SHOP_STATE = 1;
const CLOSE_SHOP_STATE  = 2;
const CLAIM_SHOP_STATE = 3;

function ShopManager(){
	this.dict = new Map();
	this.item_property_name = {};
	this.shop_item_property = {};
	this.shop_items = new Map();
	this.show_items = [];
	this.activity_list = {};
	this.max_shop_item_id = 0;
	
	this.max_activity_id = 0;

	//events.EventEmitter.call(this);
}
//util.inherits(ShopManager, events.EventEmitter);

ShopManager.prototype.getDebugAllItemString = function(){
	// /return util.inspect(this.shop_items);
	return "";
}



ShopManager.prototype.saveShopItem = function(json_item,json_image,json_propertys){

	let item_id = Number(json_item['id']);
	let shop_id = Number(json_item['shop_id']);
	
	logger.log("INFO","[ShopCache][addShopItem]"
		,'json_item:',util.inspect(json_item)
		,'json_image:',util.inspect(json_image));

	if(!(this.dict.has(shop_id))){
		logger.log("WARN","[ShopCache][addShopItem]"
			,'shop_id:',shop_id);
		return {
			'error':2,
			'error_msg' :'添加物品时,指定的商铺不存在',
		};
	}

	if(this.shop_items.has(item_id)){

		let itemBean = this.getItemBean(item_id);

		this.refreshShopItem(itemBean,json_item,json_image,json_propertys);
		
		HeadInstance.getInstance().emit("/get_my_shop_item_detail",item_id);

	}else{
		
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

	if(!(this.shop_items.has(item_id))){

		if(!(this.dict.has(shop_id))){
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
		
		let shopBean = this.getShop(shop_id);
		shopBean.addItemToShop(item_id);
		HeadInstance.getInstance().emit("/get_my_shop_item_detail",item_id);
	}else{
		logger.log("WARN","[ShopCache][addShopItem]"
			,'item_id',item_id
			,'this.shop_items:',util.inspect(this.shop_items.get(item_id)));
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
	shop_item_list,
	shop_item_property,
	shop_attention,
	activity_list,
	shop_item_attention,
	shop_item_images,
	shop_claims){
	
	g_shop_cache['dict'].clear();

	for(var i in shop_list){
		var shop_id = Number(shop_list[i]['Id']);
		//logger.log("INFO","shop_id:",shop_id);
		g_shop_cache['dict'].set(shop_id,new ShopBean());

		g_shop_cache['dict'].get(shop_id).initFromDbRow(shop_list[i]);
		let uid = Number(shop_list[i]['uid']);
		let state = Number(shop_list[i]['state']);
		PlayerProxy.getInstance().SetUserShopId(uid,shop_id,state);
		
	}
	//console.log(g_shop_cache['dict'].size);

	for(var i in shop_comment){
		var shop_id = shop_comment[i]['shop_id'];
		var shop_info = g_shop_cache['dict'][shop_id];
		if(shop_info != null){
			var comment = new ShopComment();
			comment.initFromDbRow(shop_comment[i]);
			shop_info.addComment(comment);
		}
		
	}

	for(var i in shop_item_list){

		var item = shop_item_list[i];
		var shop_id = item['shop_id'];

		var shop_info = g_shop_cache['dict'].get(shop_id);
		
		if(shop_info != null){

			var item_id = Number(item['id']);
			shop_info.addItemToShop(item_id);
			let shop_item = new ShopItem();
			shop_item.initFromDb(shop_item_list[i]);
			g_shop_cache['shop_items'].set(item_id,shop_item);
			//logger.log("SHOP_CACHE","[init][shopitem]:" + util.inspect(shop_item[i]))
			
			if(shop_item.isSpreadItem()){
				g_shop_cache['show_items'].push(item['id']);
			}
			
			g_shop_cache['max_shop_item_id'] = Math.max(g_shop_cache['max_shop_item_id'],parseInt(item['id']));
		}
	}
	g_shop_cache['shop_items'].forEach(function(value){
		logger.log("shop_item:",util.inspect(value));
	})

	//logger.log("SHOP_CACHE","max_shop_item_id:" + g_shop_cache['max_shop_item_id']);

	for(var i in shop_item_attention){
		var item_id = shop_item_attention[i]['item_id'];
		var uid = shop_item_attention[i]['uid'];
		g_shop_cache['shop_items'].get(item_id).addAttention(uid);
	}

	for(var i in shop_item_property){

		var item_id = Number(shop_item_property[i]['item_id']);
		if(g_shop_cache['shop_items'].has(item_id)){
			g_shop_cache['shop_items'].get(item_id).addItemProperty(shop_item_property[i]);
		}
	}
	logger.log("INFO",shop_attention);
	for(var i in shop_attention){
		var shop_id = Number(shop_attention[i]['shop_id']);
		if(g_shop_cache['dict'].has(shop_id)){
			g_shop_cache['dict'].get(shop_id).addAttention(shop_attention[i]['uid']);
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

		if(g_shop_cache['shop_items'].has(item_id)){
			if(image_type == 1){
				g_shop_cache['shop_items'].get(item_id).addItemShowImage(image);
			}else if(image_type == 2){
				g_shop_cache['shop_items'].get(item_id).setSpreadImage(image);
			}else if(image_type == 3){
				g_shop_cache['shop_items'].get(item_id).addItemDetailImage(image);
			}
			
		}else{
			logger.warn("SHOP_CACHE","can't find item_id in g_shop_cache['shop_items'] item_id= " + item_id);
		}
	}

	for(var i in shop_claims){
		let uid = Number(shop_claims[i]['uid']);
		let shop_id = Number(shop_claims[i]['shop_id']);
		if(g_shop_cache['dict'].has(shop_id)){
			g_shop_cache['dict'].get(shop_id).setClaim(uid);
		}
		
	}

}

ShopManager.prototype.getShopList = function(uid,city_no,area_code,category,last_index,page_size,search_key,longitude,latitude,distance){
	
	var all_list = [];
	

	this.dict.forEach(function(shop_info,key){

		var dis = shop_info.calcDistance(longitude,latitude);
		//logger.log("INFO",TAG,"dis=",dis,'last_distance=',last_distance,'distance=',distance);
		
		if( Number.isNaN(dis) || dis >= 0 ){
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
	});
	
	all_list.sort(function(a,b){
		return a['distance'] - b['distance'];
	});
	
	if(last_index >= all_list.length){
		return {
			'list' : [],
			'total' : all_list.length,
		};
	}else{

		var list = all_list.slice(last_index,last_index + page_size);
		return {
			'list': list,
			'total' : all_list.length,
		};
	}

	
}




exports.GetNearShopList = function(type,long,late,page,size){

	return [];

}

exports.getShopDetail = function(uid,shop_id){
	shop_id = Number(shop_id);

	var shop_info = g_shop_cache['dict'].get(shop_id);

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
			var shop_item = g_shop_cache['shop_items'].get(shop_item_id);
			if(shop_item.isSpreadItem()){
				json_result['shop_info']['shop_item'].push(shop_item.getItemBasicInfo());
			}
		}
	}

	return json_result;
}

ShopManager.prototype.getShop = function(shop_id){
	if(!Number.isInteger(shop_id)){
		shop_id = Number.parseInt(shop_id,10);
	}
	if(Number.isNaN(shop_id)){
		return null;
	}
	if(this.dict.has(shop_id)){
		return this.dict.get(shop_id);
	}
	return null;
}

ShopManager.prototype.getItemBean = function(item_id){
	if(this.shop_items.has(item_id)){
		return this.shop_items.get(item_id);
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
	logger.log("SHOP_CACHE",TAG,"[getShopItemDetail] params:[ uid:" + uid+ ",shop_id:" + shop_id + ",shop_item_id:" + shop_item_id + "]");
	var shop_item_detail = {};
	shop_item_detail['error'] = 0;

	var shop_info = this.getShop(shop_id);
	
	if(shop_info != null){
		var shop_item = this.getItemBean(Number(shop_item_id));
		logger.log('INFO',TAG,'item:',util.inspect(shop_item));
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



ShopManager.prototype.getShopSpread = function(last_index,longitude,latitude,city_no,area_code,distance,category_code,keyword){
	var arr_result = [];
	logger.log("INFO",'this.show_items:',this.show_items);
	let that = this;
	this.show_items.forEach(function(item_id,index){
		
		var shop_item = that.getItemBean(item_id);
		if(shop_item == null){
			return;
		}


		if(shop_item.isSpreadItem() && shop_item.matchFilter(keyword)){

			let item_category = shop_item.getCategoryCode();

			let matchCategory = DbCache.getInstance().matchCategor(category_code,item_category,"item");
			if(!matchCategory){

				return;
			}
			var shop_id = shop_item['shop_id'];

			var shop_info = that.getShop(shop_id);
			if(shop_info == null){
				return;
			}

			
			let dis = shop_info.calcDistance(longitude,latitude);
			if(Number.isNaN(dis)){
				dis = 0;
			}
			//logger.log("INFO",'dis:',dis,'distance:',distance,'result:',distance <= 0);
			if(distance <= 0 || dis < distance){
				//logger.log("INFO",'city_no:',city_no,'area_code:',area_code);
				if(shop_info.matchFilter(city_no,area_code,0)){
					logger.log("INFO","b");
					arr_result.push(shop_item.getSpreadItemInfo(dis));
				}
			}
		}
	});
	

	if(arr_result.length > 0){

		arr_result.sort(function(left,right){
			return left['distance'] - right['distance'];
		});
		var page_size = 30;
		let arr_list = arr_result.slice(last_index,last_index + page_size);
		return {
			'list': arr_list,
			'page_size' : page_size,
			'total' : arr_result.length,
		};

	}else{
		return {
			'list' : [],
			'total' : 0,
		}
	}

	
}


exports.getMyFavoritesItems = function(items){
	var item_list = [];
	//logger.log("SHOP_CACHE",util.inspect(items));
	for(var i in items){
		var item_id = items[i]['item_id'];
		
		var shop_item = g_shop_cache['shop_items'].get(item_id);
		//logger.log("SHOP_CACHE",util.inspect(shop_item));
		if(shop_item != null){
			var shop_id = shop_item['shop_id'];
			var shop = g_shop_cache['dict'].get(shop_id);

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

ShopManager.prototype.CheckHasItem = function(shop_id,item_id){
	var shop_info = this.getShop(shop_id);	
	if(shop_info != null && shop_info.hasItem(item_id)){
		return true;
	}
	return false;
}

ShopManager.prototype.FindShopInfo = function(shop_id){
	let shop_info = this.getShop(shop_id);

	if(shop_info != null){
		return{
			'state' : shop_info.getShopState()
		}
		
	}
	return null;
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
	if(this.shop_items.has(shop_item_id)){
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
	
}

exports.addShopActivity = function(guid,name,discard,image){
	
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



exports.getMyShopItemDbParams = function(item_id){
	var shop_item_info = g_shop_cache['shop_items'].get(item_id);

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

ShopManager.prototype.getShopAttentionBoard = function(uid,city,area_code,category_code,search_key){

	var list = [];

	this.dict.forEach(function(shop_info,shop_id){
		
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
	});
	
	return list.sort(function(a,b){
		return b['attention_num'] - a['attention_num']
	});
}
exports.fillScheduleShopInfo = function(json_value){
	
	
}

exports.getShopScheduleInfo = function(shop_id){
	
}

exports.addFavoritesUser = function(shop_id,item_id,uid){
	
}	

exports.setShopItemImage = function(item_id,index,image){
	
}

ShopManager.prototype.removeShopByShopId = function(shop_id){
	let shop = this.getShop(shop_id);
	if(shop == null){
		logger.log("WARN",'用户请求删除的shop不存在');
		return {'error' : 400,'error_msg' : '用户请求删除的shop不存在'};
	}

	this.dict.delete(shop_id);

	logger.log("INFO",'删除成功');
	if(this.dict.has(shop_id)){
		logger.log("INFO","aaa");
	}
	let all_remove_item = [];
	this.shop_items.forEach(function(itemBean,itemId){
		if(itemBean.getShopId() == shop_id){
			all_remove_item.push(itemId);
		}
	});
	logger.log("INFO",'to remove shop_item num',all_remove_item.length);
	all_remove_item.forEach(function(to_remove_item_id){
		this.shop_items.delete(to_remove_item_id);
	});
	all_remove_item.forEach(function(to_remove_item_id){
		let find_index = this.show_items.findIndex(function(item_id){
			return item_id == to_remove_item_id;
		});
		if(find_index >= 0){
			this.show_items.splice(find_index,1);
		}
	});
}

ShopManager.prototype.updateShopByApi = function(json_shop){
	let shop = this.getShop(json_shop['Id']);
	if(shop != null){
		shop.updateShopInfo(json_shop);
		return {
			'error' : 0,
		}
	}

	return {
		'error' : 1,
		'error_msg' : '找不到对应的商铺信息',
	}
}

ShopManager.prototype.addShopByApi = function(json_shop){
	let shop = this.getShop(json_shop['Id']);
	if(shop == null){
		shop = new ShopBean();
		shop.updateShopInfo(json_shop);
		this.dict.set(json_shop['Id'],shop);
		return {
			'error' : 0,
		}
	}

	return {
		'error' : 1,
		'error_msg' : '添加商铺时,商铺id重复',
	}
}


exports.ModifyShopByShopId = function(isAdd,shop_id,shopParams){
	
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
	if(shopBean.getShopState() != CLAIM_SHOP_STATE){
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

ShopManager.prototype.removeClaimShop = function(shop_id){
	let shopBean = this.getShop(shop_id);
	if(shopBean != null){
		shopBean.setClaim(0);
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
	if(json_result['shop_state'] != CLAIM_SHOP_STATE){
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


	return null;
}

ShopManager.prototype.removeShopItem = function(param){
	let item_id = param['id'];
	let itemBean = this.getItemBean(item_id);
	let shop_id = itemBean.getShopId();
	delete this.shop_items[item_id];
	
	for(var key in this.show_items){
		if(this.show_items[key] == item_id){
			this.show_items.splice(key,1);
			break;
		}
	}
	if(this.dict.has(shop_id)){
		let shopBean = this.getShop(shop_id);
		shopBean.removeShopItem(item_id);
	}

	return null;
}

ShopManager.prototype.updateShopState = function(shop_id,shop_state){
	let shop = this.getShop(shop_id);
	if(shop != null){
		shop.updateState(shop_state);
	}
	return;
}

ShopManager.prototype.getOwner = function(shop_id){
	let shop = this.getShop(shop_id);
	if(shop != null){
		return shop.getOwner();
	}
	return 0;
}