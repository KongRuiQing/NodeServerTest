var util = require('util');
var ShopItem = function(){
	// db row
	this.id = 0;
	this.shop_id = 0;
	this.__spread_image = "";
	/*
		key:0-17
		value:string
		*/
		this.__images = {};
		this.__imageArray = {
			'dirty' : true,
			'value' : []
		};
		this.name = "";
		this.price = 0;
		this.show_price = 0;
		this.is_show = false;
	// other db
	this.attentions = [];

	this.item_propertys = [];
}

ShopItem.prototype.getJsonValue =function(){
	return {
		'id' : this.id,
		'shop_id' : this.shop_id,
		'spread_image' : this.__spread_image,
		'images' : this.__images,
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

ShopItem.prototype.newShopItem = function(id,shop_id,images,name,price,show_price){
	this.id = id;
	this.shop_id = shop_id;
	var image_keys = ['image0','image1','image2','image3','image4','image5','image6','image7','image8','image9','image10','image11','image12','image13','image14','image15','image16','image17'];
	
	for(var key in image_keys){
		if(images[image_keys[key]].length > 0){
			this.__images[key] = images[image_keys[key]];
		}
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
		'image' : this.imageToArray(),
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
		'images' : this.imageToArray(),
		'item_property' : []
	};
	for(var i in this.item_propertys){
		item_detail['item_property'].push(this.item_propertys[i].getJsonValue());
	}

	return item_detail;
}

ShopItem.prototype.getFavoritesItemJsonValue = function(){
	var list = this.imageToArray();
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

ShopItem.prototype.imageToArray = function(){
	if(this.__imageArray['dirty']){
		this.__imageArray['value'].splice(0,this.__imageArray['value'].length);
		var list = [];
		for(var i = 0; i < 18; ++i){
			if (i in this.__images){
				list.push({
					'index' : i,
					'image' : this.__images[i]
				});
			}else{
				list.push({
					'index' : i,
					'image' : ''
				});
			}
		}
		//console.log("this.image:" + util.inspect(list));
		
		list.sort(function(a,b){
			return a['index'] - b['index'];
		});
		//console.log("list:" + util.inspect(list));
		this.__imageArray['value'].splice(0,this.__images.length);

		for(var key in list){
			//console.log("key:" + key + " list[key]:" + util.inspect(list[key]));
			this.__imageArray['value'].push(list[key]['image']);
		}
		//console.log("list:" + util.inspect(this.__imageArray['value']));
		this.__imageArray['dirty'] = false;
	}

	return this.__imageArray['value'];
}

ShopItem.prototype.setItemImage = function(index,image){

	this.__images[Number(index)] = image;
	//console.log("index:"  + index + "image:" + image);
	this.__imageArray['dirty'] = true;
}

ShopItem.prototype.delItemImage = function(index){
	this.__images[Number(index)] = null;
	this.__imageArray['dirty'] = true;
	delete this.__images[index]
}

ShopItem.prototype.setSpreadImage = function(image){
	this.__spread_image = image;
}



module.exports = ShopItem;