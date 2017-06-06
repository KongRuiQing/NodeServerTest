"use strict";
var FindUtil = require("../FindUtil.js");
var DbCache = require("../cache/DbCache");
var logger = require("../logger.js").logger();
console.log("require shopBean.js");

var ShopBean = function(){
	this.id = 0;
	this.uid = 0;
	this.name = "";
	this.beg = 0;
	this.end = 0;
	this.days = 0;
	this.__longitude = 0;
	this.__latitude = 0;
	this.city_no = 0;
	this.area_code = 0;
	this.address = "";
	this.address_brief = "";
	this.category_code1 = 0;
	this.category_code2 = 0;
	this.category_code3 = 0;
	this.info = "";
	this.distribution = "";
	this.telephone = "";
	this.email = "";
	this.qq = "";
	this.wx = "";
	this.image = "";
	this.ad_images = {};
	this.__business = "";
	this.card_image = "";
	this.card_number = "";
	this.qualification = "";
	this.state = -1;

	this.items = [];
	this.like_me = [];
	this.attentions = [];
	this.comments = [];
	this.spread_items = [];

	this.activity = null;
	this.__fix_telephone = "";
	this.__itemGroup = [];

	this.__claim = 0; // shop_state == 2 时,代表认领人的信息
	//events.EventEmitter.call(this);

	this.__cs = 0;
	this.__big_image = "";

	this.__attenton_group_messages = new Map();
}

//util.inherits(ShopBean, events.EventEmitter);

var ShopSpreadItem = function(){
	this.id = 0;
	this.expire_time = 0;
	this.image = "";
}

var ShopActivity = function(){
	this.id = 0;
	this.expire_time = new Date();
	this.image = "";
	this.name = "";
	this.info = "";
}

class ShopAttentionGroupMessage{
	
	constructor(){

	}

	get list(){

	}

}

ShopSpreadItem.prototype.newSpreadItem = function(item_id,image,time){
	this.id = item_id;
	this.expire_time = time + new Date();
	this.image = image;
}

ShopSpreadItem.prototype.changeSpreadItem = function(item_id,image,time){
	this.id = item_id;
	this.expire_time += time;
	this.image = image;
}

ShopSpreadItem.prototype.getJsonInfo = function(){
	return {
		"id" : this.id,
		"expire_time" : this.expire_time,
		"image" : this.image
	};
}


ShopBean.prototype.initFromDbRow = function(db_row){
	this.id = Number(db_row['Id']);
	this.uid = Number(db_row['uid']);
	this.name = db_row['name'];
	this.beg = Number(db_row['beg']);
	this.end = Number(db_row['end']);
	this.days = Number(db_row['days']);
	this.__longitude = parseFloat(db_row['longitude']);
	this.__latitude = parseFloat(db_row['latitude']);
	this.city_no = Number(db_row['city_no']);
	this.area_code = Number(db_row['area_code']);
	this.address = db_row['address'];
	this.qualification = db_row['qualification'];
	this.category_code1 = Number(db_row['category_code1']);
	this.category_code2 = Number(db_row['category_code2']);
	this.category_code3 = Number(db_row['category_code3']);
	this.info = db_row['info'];
	this.distribution = db_row['distribution'] || "";
	this.telephone = db_row['telephone'] || "";
	this.email = db_row['email'] || "";
	this.qq = db_row['qq'] || this.qq;
	this.wx = db_row['wx'] || this.wx;
	this.image = db_row['image'] || this.image;

	this.ad_images[0] = db_row['image1'];
	this.ad_images[1] = db_row['image2'];
	this.ad_images[2] = db_row['image3'];
	this.ad_images[3] = db_row['image4'];
	this.card_image = db_row['card_image'];
	this.card_number = db_row['card_number'];

	this.state = Number(db_row['state']);

	this.__itemGroup.push(db_row['groupName1']);
	this.__itemGroup.push(db_row['groupName2']);
	this.__itemGroup.push(db_row['groupName3']);
	this.__fix_telephone = db_row['fix_telephone'];
	this.__business = db_row['business'];

	this.__cs = Number(db_row['cs_id']);
	this.__big_image = db_row['big_image'];
}

ShopBean.prototype.updateShopInfo = function(json_value){
	if(this.id == 0 && 'Id' in json_value){
		this.id = Number(json_value['Id']);
	}
	if(this.state == -1 && 'state' in json_value){
		this.state = Number(json_value['state']);
	}
	if('name' in json_value){
		this.name = json_value['name'];
	}
	if('beg' in json_value){
		this.beg = Number(json_value['beg']);
	}
	if('end' in json_value){
		this.end = Number(json_value['end']);
	}
	if('days' in json_value){
		this.days = json_value['days'];
	}
	if('longitude' in json_value){
		this.__longitude = parseFloat(json_value['longitude']);
	}
	if('latitude' in json_value){
		this.__latitude = parseFloat(json_value['latitude']);
	}

	if('city_no' in json_value){
		this.city_no = Number(json_value['city_no']);
	}
	
	if('area_code' in json_value){
		this.area_code = Number(json_value['area_code']);
	}
	
	if('address' in json_value){
		this.address = json_value['address'];
	}
	
	if('category_code1' in json_value){
		this.category_code1 = Number(json_value['category_code1']);
	}
	if('category_code2' in json_value){
		this.category_code2 = Number(json_value['category_code2']);
	}
	if('category_code3' in json_value){
		this.category_code3 = Number(json_value['category_code3']);
	}

	if('info' in json_value){
		this.info = json_value['info'];
	}
	if('distribution' in json_value){
		this.distribution = json_value['distribution'];
	}
	if('telephone' in json_value){
		this.telephone = json_value['telephone'];
	}
	if('email' in json_value){
		this.email = json_value['email'];
	}
	if('qq' in json_value){
		this.qq = json_value['qq'];
	}

	if('wx' in json_value){
		this.wx = json_value['wx'];
	}
	if('image' in json_value){
		this.image = json_value['image'];
	}
	if('card_number' in json_value){
		this.card_number = json_value['card_number'];
	}
	if('card_image' in json_value){
		this.card_image = json_value['card_image'];
	}
	if('qualification' in json_value){
		this.qualification = json_value['qualification'];
	}

}

ShopBean.prototype.newShopBean = function(shop_info){

	this.id = Number(shop_info['id']);
	if('name' in shop_info){
		this.name = shop_info["name"];
	}
	this.beg = Number(shop_info['beg']);
	this.end = Number(shop_info['end']);
	this.days = Number(shop_info['days']);
	
	this.city_no = Number(shop_info['city_no']);
	this.area_code = Number(shop_info['area_code']);
	if('address' in shop_info){
		this.address = shop_info["address"];
	}
	//
	if('longitude' in shop_info){
		this.__longitude = parseFloat(shop_info['longitude']);
	}
	if('latitude' in shop_info){
		this.__latitude = parseFloat(shop_info['latitude']);
	}
	
	if('category_code1' in shop_info){
		this.category_code1 = Number(shop_info['category_code1']);
	}
	if('category_code2' in shop_info){
		this.category_code2 = Number(shop_info['category_code2']);
	}
	if('category_code3' in shop_info){
		this.category_code3 = Number(shop_info['category_code3']);
	}
	if('distribution' in shop_info){
		this.distribution = shop_info["distribution"];
	}
	if('telephone' in shop_info){
		this.telephone = shop_info['telephone'];
	}
	
	if('email' in shop_info){
		this.email = shop_info['email'];
	}
	if('qq' in shop_info){
		this.qq = shop_info["qq"];
	}
	if('wx' in shop_info){
		this.wx = shop_info["wx"];
	}
	
	this.__business = "";
	this.card_image = shop_info["card_image"];
	this.qualification = "";
	if('state' in shop_info){
		this.state = shop_info['state'];
	}
	
}



ShopBean.prototype.getShopBasicInfo = function(uid,longitude,latitude){
	return {
		'id' : this.id,
		'state' : this.state,
		'shop_name' : this.name,
		'shop_address' : this.address,
		'shop_image' : this.image,
		'long' : this.__longitude,
		'late' : this.__latitude,
		'shop_attention' : "",
		'attention_num' : this.attentions.length,
		'is_attention' : this.ownAttention(uid),
		'beg' : this.beg,
		'end' : this.end,
		'days' : this.days,
		'distance' : FindUtil.getFlatternDistance(this.__longitude,this.__latitude,longitude,latitude)
	};
}

ShopBean.prototype.getShopDbDetailInfo = function(){
	return {
		'id' : this.id,
		'area_code' : this.area_code,
		'category_code1' : this.category_code1,
		'category_code2' : this.category_code2,
		'category_code3' : this.category_code3,
		'beg' : this.beg,
		'end' : this.end,
		'days' : this.days,
		'address' : this.address,
		'distribution' : this.distribution,
		'qq' : this.qq,
		'wx' : this.wx,
		'email' : this.email,
		'card_image' : this.card_image,
		'card_number' : this.card_number
	};
}



ShopBean.prototype.getShopDetailInfo = function(uid){
	return {
		'id' : this.id,
		'state' : this.state,
		'name':this.name,
		'beg' : this.beg,
		'end' : this.end,
		'days' : this.days,
		'image': this.image,
		'show_images': [this.ad_images[0],this.ad_images[1],this.ad_images[2],this.ad_images[3]],
		'address' : this.address,
		'telephone' : this.telephone,
		'comment_num' : this.comments.length,
		'comment' : this.getLastComment(),
		'shop_item' : [],
		'shop_info' : this.info,
		'qq' : this.qq,
		'wx' : this.wx,
		'shop_email' : this.email,
		'distribution_info' : this.distribution,
		'qualification' : this.qualification,
		'area_code' : this.area_code,
		'category_code1' : this.category_code1,
		'category_code2' : this.category_code2,
		'category_code3' : this.category_code3,
		'item_groups' : this.__itemGroup,
		'fix_telephone' : this.__fix_telephone,
		'business' : this.__business,
		'big_image' : this.__big_image,
	}
}

ShopBean.prototype.getLastComment = function(){
	if(this.comments.length > 0){
		return this.comments[this.comments.length - 1].getInfo();
	}
	return {};
}

ShopBean.prototype.getShopNearInfo = function(longitude,latitude){
	return {
		'shop_name' : this.name,
		'shop_address' : this.address_brief,
		'shop_image' : this.image,
		'long' : this.__longitude,
		'late' : this.__latitude,
		'distance' : FindUtil.getFlatternDistance(this.__longitude,this.__latitude,longitude,latitude)
	};
}

ShopBean.prototype.addAttention = function(uid){
	if(typeof uid != 'number'){
		uid = Number(uid);
	}
	let index = this.attentions.indexOf(uid);
	if(index < 0){
		this.attentions.push(uid);
		
	}
}
ShopBean.prototype.ownAttention = function(uid){
	return this.attentions.indexOf(uid) >= 0;
}

ShopBean.prototype.cancelAttention = function(uid){
	let index = this.attentions.indexOf(uid);
	if(index >= 0){
		this.attentions.splice(index,1);
	}
}

ShopBean.prototype.getAttentionNum = function(){
	if(this.attentions == null){
		return 0;
	}

	return this.attentions.length;
}

ShopBean.prototype.addItemToShop = function(item_id){
	this.items.push(item_id);
}

ShopBean.prototype.matchFilter = function(city_no,area_code,category_code){
	if(city_no != 0 && city_no != this.city_no){
		return false;
	}

	if(area_code != 0 && area_code != this.area_code){
		return false;
	}
	
	if(category_code != 0){
		if(DbCache.getInstance().matchCategor(category_code,this.category_code1,'shop')){
			return true;
		}
		if(DbCache.getInstance().matchCategor(category_code,this.category_code2,'shop')){
			return true;
		}
		if(DbCache.getInstance().matchCategor(category_code,this.category_code3,'shop')){
			return true;
		}
		return false;
	}
	
	return true;
}

ShopBean.prototype.getMyShopInfo = function(){

	return {
		'id' : this.id,
		'name':this.name,
		'beg' : this.beg,
		'end' : this.end,
		'days' : this.days,
		'image': this.image,
		'longitude' : this.__longitude,
		'latitude' : this.__latitude,
		'city_no' : this.city_no,
		'info' :this.info,
		'address' : this.address,
		'telephone' : this.telephone,
		'shop_info' : this.info,
		'qq' : this.qq,
		'wx' : this.wx,
		'shop_email' : this.email,
		'email' : this.email,
		'distribution_info' : this.distribution,
		'distribution' : this.distribution,
		'qualification' : this.qualification,
		'area_code' : this.area_code,
		'category_code1' : this.category_code1,
		'category_code2' : this.category_code2,
		'category_code3' : this.category_code3,
		'card_image' : this.card_image,
		'card_number' : this.card_number,
		'attention' : false,
		'comment_num' : 0,
		'shop_item' : [],
		'state' : this.state,
		'image1' : '',
		'image2' : '',
		'image3' : '',
		'promotion_image' : '',
		'near_image' : '',
		'business' : this.__business,
		'image_in_attention' : '',

	};
}

ShopBean.prototype.getShopItems = function(){
	return this.items;
}

ShopBean.prototype.addComment = function(comment){

	this.comments.push(comment);
}

ShopBean.prototype.getItems = function(){
	return this.items;
}

ShopBean.prototype.hasItem = function(item_id){
	for(var key in this.items){
		if(item_id == this.items[key]){
			return true;
		}
	}
	return false;
}

ShopBean.prototype.getShopState = function(){
	return this.state;
}

ShopBean.prototype.getClaim = function(){
	return this.__claim;
}

ShopBean.prototype.setClaim = function(uid){
	this.__claim = uid;
}

ShopBean.prototype.changeShopBasicInfo = function(image,address,telephone){
	this.image = image;
	
	this.address = address;
	this.telephone = telephone;
}

ShopBean.prototype.getMyShopBasicInfo = function(){
	return {
		'id' : this.id,
		'image' : this.image,
		'address' : this.address,
		'telephone' : this.telephone,
		'item_groups' : this.__itemGroup,
	};
}

ShopBean.prototype.getSellerInfo = function(){
	
	return {
		'id' : this.id,
		'state' : this.state,
		'name' : this.name,
		'city_no' : this.city_no,
		'area_code' : this.area_code,
		'category_code1' : this.category_code1,
		'category_code2' : this.category_code2,
		'category_code3' : this.category_code3,
		'beg' : this.beg,
		'end' : this.end,
		'days' : this.days,
		'address' : this.address,
		'telephone' : this.telephone,
		'business' : this.__business,
		'distribution' : this.distribution,
		'fix_telephone' : this.__fix_telephone,
		'qq' : this.qq,
		'wx' : this.wx,
		'email' : this.email,
		'qualification' : this.qualification,
		'longitude' : this.__longitude,
		'latitude' : this.__latitude,
		'image1' : this.ad_images[0],
		'image2' : this.ad_images[1],
		'image3' : this.ad_images[2],
		'image4' : this.ad_images[3],
		
	};
}

ShopBean.prototype.addShopSpreadItem = function(item_id,image,months){
	var find_result = false;
	var spread_item = null;
	for(var key in this.spread_items){
		spread_item = this.spread_items[key];
		if(spread_item.id == item_id){
			find_result = true;
			spread_item.changeSpreadItem(item_id,image,months * 30 * 24 * 60 * 60);
		}
	}
	if(!find_result){
		spread_item = new ShopSpreadItem();
		sprad_item.newSpreadItem(item_id,time,image,months * 30 * 24 * 60 * 60);
		this.spread_items.push(spread_item);
	}
	return spread_item.getJsonInfo();
}

ShopBean.prototype.addShopActivity = function(){
	if(this.activity == null){
		this.activity = new ShopActivity();
		this.activity.newActivity(expire_time,image,name,info);
	}else{
		this.activity.newActivity(expire_time,image,name,info);	
	}

	if(this.activity != null){
		return this.activity.getJsonInfo();
	}
	return {};
}

ShopBean.prototype.updateSellerInfo = function(json_value){
	
	if(this.id == json_value['id']){
		
		if('shop_name' in json_value){
			this.name = json_value['shop_name'];
		}

		if('city_no' in json_value){
			this.city_no = json_value['city_no'];
		}

		if('area_code' in json_value){
			this.area_code = json_value['area_code'];
		}
		if('category_code1' in json_value){
			this.category_code1 = json_value['category_code1'];
		}
		if('category_code2' in json_value){
			this.category_code2 = json_value['category_code2'];
		}
		if('category_code3' in json_value){
			this.category_code3 = json_value['category_code3'];
		}

		if('beg' in json_value){
			this.beg = json_value['beg'];
		}
		
		if('end' in json_value){
			this.end = json_value['end'];
		}
		if('days' in json_value){
			this.days = json_value['days'];
		}

		if('address' in json_value){
			this.address = json_value['address'];
		}
		if('telephone' in json_value){
			this.telephone = json_value['telephone'];
		}
		if('business' in json_value){
			this.__business = json_value['business'];
		}

		if('distribution' in json_value){
			this.distribution = json_value['distribution'];
		}
		if('fix_telephone' in json_value){
			this.__fix_telephone = json_value['fix_telephone'];
		}
		
		if('qq' in json_value){
			this.qq = json_value['qq'];
		}
		if('wx' in json_value){
			this.wx = json_value['wx'];
		}
		if('email' in json_value){
			this.email = json_value['email'];
		}
		if('qualification' in json_value){
			this.qualification = json_value['qualification'];
		}
		if('longitude' in json_value){
			this.__longitude = json_value['longitude'];
		}
		if('latitude' in json_value){
			this.__latitude = json_value['latitude'];
		}
		if('image1' in json_value){
			this.ad_images[0] = json_value['image1'];
		}
		if('image2' in json_value){
			this.ad_images[1] = json_value['image2'];
		}
		if('image3' in json_value){
			this.ad_images[2] = json_value['image3'];
		}
		if('image4' in json_value){
			this.ad_images[3] = json_value['image4'];
		}
	}

	return null;
}

ShopBean.prototype.containsItem = function(item_id){
	for(var key in this.items){
		if(this.items[key] == item_id){
			return true;
		}
	}
	return false;
}

ShopBean.prototype.getShopAttentionInfo = function(){
	return {
		'category_code' : this.category_code1,
		'shop_image' : this.image,
		'shop_attention_num' : this.attentions.length,
		'shop_name' : this.name,
		'shop_business' : this.__business,
		'shop_id' : this.id,
		'telephone' : this.telephone,
	};
}

ShopBean.prototype.search = function(search_key){
	if(search_key.length == 0){
		return true;
	}
	if(this.name.indexOf(search_key) >= 0){
		return true;
	}
	return false;
}

ShopBean.prototype.getShopBoardInfo = function(uid){
	return {
		'id' : this.id,
		'shop_name' : this.name,
		'shop_address' : this.address_brief,
		'shop_image' : this.image,
		'long' : this.__longitude,
		'late' : this.__latitude,
		'shop_attention' : "",
		'attention_num' : this.attentions.length,
		'is_attention' : this.ownAttention(uid),
	};
}

ShopBean.prototype.getSheduleInfo = function(){
	return {
		'id' : this.id,
		'shop_name' : this.name,
		'shop_address' : this.address,
		'shop_image' : this.image,
		'long' : this.__longitude,
		'late' : this.__latitude,
	};
}
ShopBean.prototype.calcDistance = function(longitude,latitude){
	//logger.log("INFO","shopBean:",longitude,latitude,this.__longitude,this.__latitude);
	return FindUtil.getFlatternDistance(longitude,latitude,this.__longitude,this.__latitude)
}

ShopBean.prototype.getClaimState = function(){
	return {
		'shop_id' : this.id,
		'shop_name' : this.name,
		'shop_state' : this.state,
		'city_no' : this.city_no,
		'area_code' : this.area_code,
		'claim' : this.__claim,
	};
}
ShopBean.prototype.updateState = function(state){
	this.state = state;
}

ShopBean.prototype.getOwner = function(){
	return this.uid;
}

ShopBean.prototype.removeShopItem = function(to_remove_item_id){
	let find_index = this.items.findIndex(function(item_id){
		return item_id == to_remove_item_id;
	});
	if(find_index >= 0){
		this.items.splice(find_index,1);
	}
}

ShopBean.prototype.getAttentionGroupMessageList = function(){

}

ShopBean.prototype.addAttentionGroupMessage = function(json_msg){
	let msg = new AttentionGroupMessage();
	msg.initFromJSON(json_msg);

	this.__attenton_group_messages.set(msg.getId(),msg);
}

module.exports = ShopBean;