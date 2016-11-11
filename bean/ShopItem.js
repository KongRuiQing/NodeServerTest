
var ShopItem = function(){
	// db row
	this.id = 0;
	this.shop_id = 0;
	this.spread_image = "";
	this.images = [];
	this.name = "";
	this.price = 0;
	this.show_price = 0;
	this.is_show = false;
	// other db
	this.attentions = [];

	this.item_propertys = [];
}

var ShopItemProperty = function(db_row){
	this.id = Number(db_row['id']);
	this.item_id = Number(db_row['item_id']);
	this.property_type = Number(db_row['property_type']);
	this.property_value = Number(db_row['property_value']);
}

ShopItemProperty.prototype.getJsonValue = function(){
	return {
		'id' : this.id,
		'property_type' : this.property_type,
		'property_value' : this.property_value
	};
}

ShopItem.prototype.getSpreadJsonValue = function(){
	var json_result = {
		'id':this.id,
		'shop_id' : this.shop_id,
		'spread_image' : this.spread_image,
		'name' : this.name,
		'price' : this.price,
		'show_price' : this.show_price,
		'is_show' : this.is_show
	};
	return json_result;
}

ShopItem.prototype.initFromDb = function(db_row){
	this.id = Number(db_row['id']);
	this.shop_id = Number(db_row['shop_id']);
	this.spread_image = db_row['image'];
	this.images.push(db_row['image1']);
	this.images.push(db_row['image2']);
	this.images.push(db_row['image3']);
	this.images.push(db_row['image4']);
	this.images.push(db_row['image5']);
	this.images.push(db_row['image6']);
	this.images.push(db_row['image7']);
	this.images.push(db_row['image8']);
	this.name = db_row['name'];
	this.price = parseFloat(db_row['price']);
	this.show_price = parseFloat(db_row['show_price']);
	this.is_show = Number(db_row['is_show']) == 1;
}

ShopItem.prototype.newShopItem = function(id,shop_id,images,name,price,show_price){
	this.id = id;
	this.shop_id = shop_id;
	
	for(var key in images){
		this.images.push(images[key]);
	}
	this.name = name;
	this.price = price;
	this.show_price = show_price;
}

ShopItem.prototype.addAttention = function(uid){
	this.attentions.push(uid);
}

ShopItem.prototype.isSpreadItem = function(){
	return this.is_show;
}

ShopItem.prototype.addItemProperty = function(db_row){
	this.item_propertys.push(new ShopItemProperty(db_row));
}

ShopItem.prototype.getSpreadJsonItem = function(){
	return {
		'image': this.spread_image,
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
		'image': this.spread_image,
		'item_name':this.name,
		'item_price':this.price,
		'item_show_price' : this.show_price,
		'item_attention': this.attentions.length,
		'item_id' : this.id,
		'shop_id' : this.shop_id
	};
}

ShopItem.prototype.getDetailJsonItem = function(){
	var item_detail = {
		'name' : this.name,
		'price' : this.price,
		'show_price' : this.show_price,
		'images' : this.images,
		'item_property' : []
	};
	for(var i in this.item_propertys){
		item_detail.push(this.item_propertys[i].getJsonValue());
	}

	return item_detail;
}

ShopItem.prototype.getFavoritesItemJsonValue = function(){
	return {
		'item_name' : this.name,
		'price' : this.price,
		'image' : this.images.length > 0?this.images[0]:""
	};
	
}



module.exports = ShopItem;