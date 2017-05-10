'use strict';

var util = require('util');

var ShopItemState = {}

ShopItemState.SHELVE_STATE = 1;
ShopItemState.OFF_SHELVE_STATE = 2;

ShopItemState.getShelveState = function(value){
	value = Number(value);
	if(value <= 1){
		return ShopItemState.SHELVE_STATE;
	}
	if(value >= 2){
		return ShopItemState.OFF_SHELVE_STATE;
	}

	return ShopItemState.SHELVE_STATE;
}

var ShopItem = function(){
	// db row
	this.id = 0;
	this.shop_id = 0;
	this.__spread_image = "";
	
	this.name = "";
	this.price = 0;
	this.show_price = 0;
	this.is_show = false;
	this.__groupIndex = 0;
	// other db
	this.attentions = [];

	this.__item_propertys = [];

	this.__show_images = [];
	this.__detail_images = [];

	this.__category_code = 0;

	this.__link = "";
	this.__state = 0;
}

ShopItem.prototype.getId = function(){
	return this.id;
}

ShopItem.prototype.getJsonValue =function(){
	return {
		'id' : this.id,
		'shop_id' : this.shop_id,
		'spread_image' : this.__spread_image,
		'images' : this.__show_images,
		'name' : this.name,
		'price' : this.price,
		'show_price' : this.show_price,
		'is_show' : this.is_show,
		'item_propertys' : this.getItemPropertys()
	};
}

var ShopItemProperty = function(){
	this.id = 0;
	this.item_id = 0;
	this.property_type = "";
	this.property_value = "";
}

ShopItemProperty.prototype.initFromDb = function(db_row){
	if('id' in db_row){
		this.id = Number(db_row['id']);
	}else{
		this.id = 0;
	}
	
	this.item_id = Number(db_row['item_id']);
	this.property_type = db_row['property_type'];
	this.property_value = db_row['property_value'];

}

ShopItemProperty.prototype.getJsonValue = function(){
	return {
		'id' : this.id,
		'property_type' : this.property_type,
		'property_value' : this.property_value
	};
}

ShopItemProperty.prototype.getDbParams = function(){
	return{
		'id' : this.id,
		'item_id' : this.item_id,
		'property_type' : this.property_type,
		'property_value' : this.property_value
	}
}

ShopItemProperty.prototype.setItemProperty = function(name,value){

	this.property_type = name;
	this.property_value = value;
}

ShopItem.prototype.getSpreadJsonValue = function(){
	var json_result = {
		'id':this.id,
		'shop_id' : this.shop_id,
		'spread_image' : this.__spread_image,
		'name' : this.name,
		'price' : this.price,
		'show_price' : this.show_price,
		'is_show' : this.is_show
	};
	return json_result;
}

ShopItem.prototype.initFromDb = function(db_row){
	//console.log(util.inspect(db_row));
	this.id = Number(db_row['id']);
	this.shop_id = Number(db_row['shop_id']);
	//this.__spread_image = db_row['image'];
	this.name = db_row['name'];
	this.price = parseFloat(db_row['price']);
	this.show_price = parseFloat(db_row['show_price']);
	this.is_show = Number(db_row['is_show']) == 1;
	this.__category_code = Number(db_row['category_code']);
	if('group_index' in db_row){
		this.__groupIndex = Number(db_row['group_index']);
	}
	this.__link = db_row['link'];
	this.__state = ShopItemState.getShelveState(Number(db_row['state']));
}


ShopItem.prototype.setItemShowImage = function(images){
	this.__show_images.splice(0,this.__show_images.length);
	for(var k in images){
		this.__show_images.push(images[k]);
	}
} 

ShopItem.prototype.addItemShowImage = function(image){
	this.__show_images.push(image);
}


ShopItem.prototype.setItemDetailImage = function(images){
	this.__detail_images.splice(0,this.__detail_images.length);
	for(var k in images){
		this.__detail_images.push(images[k]);
	}
}

ShopItem.prototype.addItemDetailImage = function(image){
	this.__detail_images.push(image);
}

ShopItem.prototype.addAttention = function(uid){
	this.attentions.push(uid);
}

ShopItem.prototype.isSpreadItem = function(){
	return this.is_show;
}

ShopItem.prototype.isShelve = function(){
	return this.__state == ShopItemState.SHELVE_STATE;
}

ShopItem.prototype.addItemProperty = function(db_row){
	var itemProperty = new ShopItemProperty();
	itemProperty.initFromDb(db_row);
	this.__item_propertys.push(itemProperty);
}

ShopItem.prototype.getSpreadJsonItem = function(){
	return {
		'image': this.__spread_image,
		'item_name':this.name,
		'item_price':this.price,
		'item_show_price' : this.show_price,
		'item_attention': this.attentions.length,
		'item_id' : this.id,
		'shop_id' : this.shop_id
	};
}

ShopItem.prototype.getItemBasicInfo = function(){
	
	let image = this.__spread_image;
	
	if(image == null || image == undefined || typeof image != 'string' || image.length == 0){
		image = this.__detail_images[0];
	}

	if(image == null || image == undefined || typeof image != 'string' || image.length == 0){
		image = "";
	}

	

	return {
		'image': image,
		'item_name':this.name,
		'item_price':this.price,
		'item_show_price' : this.show_price,
		'item_attention': this.attentions.length,
		'item_id' : this.id,
		'shop_id' : this.shop_id,
		'group_index' : this.__groupIndex,
		'state' : this.__state,
	};
}

ShopItem.prototype.getMyShopItemInfo = function(){
	
	let image = this.__spread_image;
	if(image == null || image == undefined || typeof image != 'string' || image.length == 0){
		image = this.__detail_images[0];
	}
	if(image == null || image == undefined || typeof image != 'string' || image.length == 0){
		image = "";
	}

	return {
		'image' : image,
		'item_name' : this.name,
		'item_price':this.price,
		'item_show_price' : this.show_price,
		'item_attention': this.attentions.length,
		'item_id' : this.id,
		'shop_id' : this.shop_id,
		'group_index' : this.__groupIndex,
	};
}

ShopItem.prototype.getItemPropertys = function(){
	var result = [];
	for(var key in this.__item_propertys){
		result.push(this.__item_propertys[key].getJsonValue())
	}
	return result;
}

ShopItem.prototype.getItemLinks = function(){
	return [];
}

ShopItem.prototype.getDetailJsonItem = function(){
	var item_detail = {
		'image' : this.__spread_image,
		'item_name' : this.name,
		'item_price' : this.price,
		'item_show_price' : this.show_price,
		'detail_image' : this.__detail_images,
		'show_image' : this.__show_images,
		'item_id' : this.id,
		'shop_id' : this.shop_id,
		'item_attention' : 0,
		'item_property' : [],
		'link':this.__link,
	};
	for(var i in this.__item_propertys){
		item_detail['item_property'].push(this.__item_propertys[i].getJsonValue());
	}

	return item_detail;
}

ShopItem.prototype.getDetailJsonItemInMyShop = function(){
	var item_detail = {
		'item_name' : this.name,
		'item_price' : this.price,
		'item_show_price' : this.show_price,
		'item_id' : this.id,
		'detail_image' : this.__detail_images,
		'show_image' : this.__show_images,
		'category_code' : this.__category_code,
		'link' : this.__link,
		'item_property' : []
	};
	for(var i in this.__item_propertys){
		item_detail['item_property'].push(this.__item_propertys[i].getJsonValue());
	}

	return item_detail;
}

ShopItem.prototype.getFavoritesItemJsonValue = function(){
	var list = this.__show_image;
	return {
		'item_name' : this.name,
		'price' : this.price,
		'image' : (list == null || list.length == 0)?"":list[0],
	};
	
}

ShopItem.prototype.matchFilter = function(keyword){
	if(this.name == null){
		return false;
	}
	if(keyword == null){
		return true;
	}
	if(keyword.length == 0){
		return true;
	}
	
	return this.name.indexOf(keyword) >= 0
}


ShopItem.prototype.saveShopItem = function(json_value){

	for(var i = 1; i <= 8; ++i){
		if(('image_' + i) in json_value && json_value['image_' + i].length > 0){
			this.images[i - 1] = json_value['image_' + i];
		}
	}
	

	this.name = json_value['name'];
	this.price = json_value['price'];
	this.show_price = json_value['show_price'];

	for(var i = 0; i < 10; ++i){
		var name_key = "property_name_" + i;
		var value_key = "property_value_" + i;

		if((name_key in json_value) && (value_key in json_value)){
			
			while(i >= this.__item_propertys.length){
				this.__item_propertys.push(new ShopItemProperty());
			}

			this.__item_propertys[i].setItemProperty(json_value[name_key],json_value[value_key]);
		}
	}
	return true;
}

ShopItem.prototype.getDbParams = function(){

	var item_propertys = [];
	for(var key in this.__item_propertys){
		item_propertys.push(this.__item_propertys[key].getDbParams());
	}

	return {
		'id' : this.id,
		'name' : this.name,
		'price' : this.price,
		'show_price' : this.show_price,
		'item_propertys' : item_propertys
	};
}



ShopItem.prototype.setSpreadImage = function(image){
	this.__spread_image = image;
}


ShopItem.prototype.getSpreadItemInfo = function(dis){
	return {
		'distance' : dis * 3,
		'image': this.__spread_image,
		'item_name':this.name,
		'item_price':this.price,
		'item_show_price' : this.show_price,
		'item_attention': this.attentions.length,
		'item_id' : this.id,
		'shop_id' : this.shop_id
	}
}

ShopItem.prototype.getCategoryCode = function(){
	return this.__category_code;
}

ShopItem.prototype.getShopId = function(){
	return this.shop_id;
}

ShopItem.prototype.updateImage = function(json_image){
	if('image_type' in json_image){
		if(json_image['image_type'] == 1){
			if(json_image['image'] != null){
				this.__show_images[json_image['index']] = json_image['image'];
				return true;
			}

		}else if(json_image['image_type'] == 2){
			if(json_image['image'] != null){
				this.__spread_image = json_image['image'];
				return true;
			}
		}else if(json_image['image_type'] == 3){
			if(json_image['image'] != null){
				this.__detail_images[json_image['index']] = json_image['image'];
				return true;
			}
		}

	}
	return false;
}

ShopItem.prototype.updateProperty = function(json_property){
	if('index' in json_property){
		let index = Number(json_property['index']);
		while(index >= this.__item_propertys.length){
			this.__item_propertys.push(new ShopItemProperty());
		}
		this.__item_propertys[index].initFromDb(json_property);

	}
}

ShopItem.prototype.offShelve = function(state){
	this.__state = state;
}

module.exports = ShopItem;