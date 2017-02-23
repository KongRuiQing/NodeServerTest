var util = require('util');
var ShopItem = function(){
	// db row
	this.id = 0;
	this.shop_id = 0;
	this.__spread_image = "";
	
	this.name = "";
	this.price = 0;
	this.show_price = 0;
	this.is_show = false;
	// other db
	this.attentions = [];

	this.item_propertys = [];

	this.__show_images = [];
	this.__detail_images = [];
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
	this.id = Number(db_row['id']);
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

ShopItem.prototype.addItemProperty = function(db_row){
	var itemProperty = new ShopItemProperty();
	itemProperty.initFromDb(db_row);
	this.item_propertys.push(itemProperty);
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

ShopItem.prototype.getMyShopItemInfo = function(){
	return {
		'image' : this.show_image,
		'item_name' : this.name,
		'item_price':this.price,
		'item_show_price' : this.show_price,
		'item_attention': this.attentions.length,
		'item_id' : this.id,
		'shop_id' : this.shop_id,
		'propertys' : this.getItemPropertys(),
		'links' : this.getItemLinks()
	};
}

ShopItem.prototype.getItemPropertys = function(){
	var result = [];
	for(var key in this.item_propertys){
		result.push(this.item_propertys[key].getJsonValue())
	}
	return result;
}

ShopItem.prototype.getItemLinks = function(){
	return [];
}

ShopItem.prototype.getDetailJsonItem = function(){
	var item_detail = {
		'name' : this.name,
		'price' : this.price,
		'show_price' : this.show_price,
		'detail_image' : this.__detail_images,
		'show_image' : this.__show_images,
		'item_property' : []
	};
	for(var i in this.item_propertys){
		item_detail['item_property'].push(this.item_propertys[i].getJsonValue());
	}

	return item_detail;
}

ShopItem.prototype.getFavoritesItemJsonValue = function(){
	var list = this.__show_image;
	return {
		'item_name' : this.name,
		'price' : this.price,
		'image' : list.length > 0?list[0]:""
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
			
			while(i >= this.item_propertys.length){
				this.item_propertys.push(new ShopItemProperty());
			}

			this.item_propertys[i].setItemProperty(json_value[name_key],json_value[value_key]);
		}
	}
	return true;
}

ShopItem.prototype.getDbParams = function(){

	var item_propertys = [];
	for(var key in this.item_propertys){
		item_propertys.push(this.item_propertys[key].getDbParams());
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

ShopItem.prototype.getShopId = function(){
	return this.shop_id;
}
module.exports = ShopItem;