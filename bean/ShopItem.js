
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
	var itemProperty = new ShopItemProperty();
	itemProperty.initFromDb(db_row);
	this.item_propertys.push(itemProperty);
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

ShopItem.prototype.getMyShopItemInfo = function(){
	return {
		'image' : this.images,
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
		'images' : this.images,
		'item_property' : []
	};
	for(var i in this.item_propertys){
		item_detail['item_property'].push(this.item_propertys[i].getJsonValue());
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
		'image1' : this.images[0],
		'image2' : this.images[1],
		'image3' : this.images[2],
		'image4' : this.images[3],
		'image5' : this.images[4],
		'image6' : this.images[5],
		'image7' : this.images[6],
		'image8' : this.images[7],
		'name' : this.name,
		'price' : this.price,
		'show_price' : this.show_price,
		'item_propertys' : item_propertys
	};
}


module.exports = ShopItem;