
var FindUtil = require("../FindUtil.js");

var ShopBean = function(){
	this.id = 0;
	this.name = "";
	this.beg = 0;
	this.end = 0;
	this.days = 0;
	this.longitude = 0;
	this.latitude = 0;
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
	this.ad_images = [];
	this.business = "";
	this.card_image = [];
	this.qualification = "";
	this.state = 0;

	this.items = [];
	this.like_me = [];
	this.attentions = [];
	this.comments = [];
	this.spread_items = [];

	this.activity = null;
}

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
	this.name = db_row['name'];
	this.beg = Number(db_row['beg']);
	this.end = Number(db_row['end']);
	this.days = Number(db_row['days']);
	this.longitude = parseFloat(db_row['longitude']);
	this.latitude = parseFloat(db_row['latitude']);
	this.city_no = Number(db_row['city_no']);
	this.area_code = Number(db_row['area_code']);
	this.address = db_row['address'];
	this.category_code1 = Number(db_row['category_code1']);
	this.category_code2 = Number(db_row['category_code2']);
	this.category_code3 = Number(db_row['category_code3']);
	this.info = db_row['info'];
	this.distribution = db_row['distribution'];
	this.telephone = db_row['telephone'];
	this.email = db_row['email'];
	this.qq = db_row['qq'];
	this.wx = db_row['wx'];
	this.image = db_row['image'];
	this.card_image.push(db_row['card_image_1']);
	this.card_image.push(db_row['card_image_2']);

	this.state = Number(db_row['state']);
}

ShopBean.prototype.newShopBean = function(shop_info){

	this.id = Number(shop_info['id']);
	if('name' in shop_info){
		this.name = shop_info["name"];
	}
	this.beg = Number(shop_info['beg']);
	this.end = Number(shop_info['end']);
	this.days = Number(shop_info['days']);
	this.longitude = parseFloat(shop_info['longitude']);
	this.latitude = parseFloat(shop_info['latitude']);
	this.city_no = Number(shop_info['city_no']);
	this.area_code = Number(shop_info['area_code']);
	if('address' in shop_info){
		this.address = shop_info["address"];
	}
	//
	if('category_code1' in shop_info){
		this.category_code1 = Number(shop_info['category_code1']);
	}
	if('category_code2' in shop_info){
		this.category_code2 = Number(shop_info['category_code2']);
	}
	if('category_code3' in shop_info){
		this.category_code3 = Number(shop_info['category_code3']);
	}
	//this.address_brief = shop_info["address"];
	
	//this.info = "";
	this.distribution = shop_info["distribution"];
	this.telephone = shop_info['telephone'];
	if('email' in shop_info){
		this.email = shop_info['email'];
	}
	if('qq' in shop_info){
		this.qq = shop_info["qq"];
	}
	if('wx' in shop_info){
		this.wx = shop_info["wx"];
	}
	
	this.business = "";
	this.card_image = [shop_info["card_image_1"],shop_info["card_image_2"]];
	this.state = 0;
}



ShopBean.prototype.getShopBasicInfo = function(uid){
	return {
		'id' : this.id,
		'shop_name' : this.name,
		'shop_address' : this.address_brief,
		'shop_image' : this.image,
		'long' : this.longitude,
		'late' : this.latitude,
		'shop_attention' : "",
		'attention_num' : this.attentions.length,
		'is_attention' : this.ownAttention(uid),
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
		'card_image_1' : this.card_image[0],
		'card_image_2' : this.card_image[1]
	};
}



ShopBean.prototype.getShopDetailInfo = function(uid){
	return {
		'id' : this.id,
		'name':this.name,
		'beg' : this.beg,
		'end' : this.end,
		'days' : this.days,
		'attention': this.ownAttention(uid),
		'image': this.image,
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
		'long' : this.longitude,
		'late' : this.latitude,
		'distance' : FindUtil.getFlatternDistance(this.longitude,this.latitude,longitude,latitude)
	};
}

ShopBean.prototype.addAttention = function(uid){

	this.attentions.push(uid);
}

ShopBean.prototype.cancelAttention = function(uid){
	var index = this.attentions.indexOf(uid);
	if(index >= 0){
		this.attentions.splice(index,1);
	}
}

ShopBean.prototype.ownAttention = function(uid){

	if(this.attentions == null){
		return false;
	}

	var num_uid = Number(uid);
	if(num_uid <= 0) {
		return false;
	}
	for(var key in this.attentions){
		if(this.attentions[key] == num_uid){
			return true;
		}
	}
	return false;
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
	if(this.state == 0){
		return false;
	}
	if(category_code != 0 
		&& (category_code != this.category_code3)
		&& (category_code != this.category_code2)
		&& (category_code != this.category_code1))
	{
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
		'longitude' : this.longitude,
		'latitude' : this.latitude,
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
		'card_image_1' : this.card_image.length >= 1 ? this.card_image[0] : '',
		'card_image_2' : this.card_image.length >= 2 ? this.card_image[1] : '',
		'attention' : false,
		'comment_num' : 0,
		'shop_item' : [],
		'state' : this.state,
		'image1' : '',
		'image2' : '',
		'image3' : '',
		'promotion_image' : '',
		'near_image' : '',
		'business' : '',
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

ShopBean.prototype.changeShopBasicInfo = function(image,address,telephone){
	if(image.length > 0){
		this.image = image;
	}
	
	this.address = address;
	this.telephone = telephone;
}

ShopBean.prototype.getMyShopBasicInfo = function(){
	return {
		'id' : this.id,
		'image' : this.image,
		'address' : this.address,
		'telephone' : this.telephone
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

ShopBean.prototype.saveShopDetail = function(json_value){
	
	if(this.id = json_value['id']){
		
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
		if('distribution' in json_value){
			this.distribution = json_value['distribution'];
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
		if('card_image_1' in json_value && json_value['card_image_1'].length > 0){
			if(this.card_image.length == 0){
				this.card_image.push(json_value['card_image_1']);
			}else{
				this.card_image[0] = json_value['card_image_1'];
			}
		}
		if('card_image_2' in json_value && json_value['card_image_2'].length > 0){
			if(this.card_image.length == 1){
				this.card_image.push(json_value['card_image_2']);
			}else if(this.card_image.length >= 2){
				this.card_image[1] = json_value['card_image_2'];
			}else{
				this.card_image.push("");
				this.card_image.push("");
				this.card_image[1] = json_value['card_image_2'];
			}
		}

		return {
			'id' : this.id,
			'info' : this.info,
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
			'card_image_1' : this.card_image[0],
			'card_image_2' : this.card_image[1],
			'qualification' : this.qualification
		};
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
		'shop_business' : this.business,
		'shop_id' : this.id
	};
}

module.exports = ShopBean;