'use strict';
var logger = require("../logger.js").logger();

class MyShop {
	constructor() {
		this.__items = new Map();
		this.__shop = new ShopBean();
	}

	getShopInfo(){
		return null;
	}

	addItem(json_item,json_image,json_propertys) {
		let item_id = json_item['id'];
		if (!this.__items.has(item_id)) {
			let item = new ShopItem();
			item.initFromDb(json_item);
			item.initImageFromDb(json_image);
			item.initPropertyFromDb(json_propertys);
			this.__items.set(item_id, item);
		}
	}

	saveItem(json_item,json_image,json_propertys) {
		let item_id = json_item['id'];
		if (this.__items.has(item_id)) {
			let item = this.__items.get(item_id);
			item.initFromDb(json_item);
			item.initImageFromDb(json_image);
			item.initPropertyFromDb(json_propertys);
			this.__items.set(item_id,item);
		}
	}

	removeItem(json_item) {
		let item_id = json_item['id'];
		this.__items.delete(item_id);
	}


}


class MyShopService {
	constructor() {
		this.__shop = new Map();
	}
	addItemToShop(uid, json_item,json_image,json_propertys) {
		if (this.__shop.has(uid)) {
			let shop = this.__shop.get(uid);
			shop.addItem(json_item,json_image.json_propertys);
		}
	}
	saveItemInShop(uid, json_item) {
		if (this.__shop.has(uid)) {
			let shop = this.__shop.get(uid);
			shop.saveItem(json_item,json_image,json_propertys);
		}
	}
	getMyShopInfo(uid){
		if(this.__shop.has(uid)){
			let shop = this.__shop.get(uid);
			return shop.getShopInfo();
		}
		return null;
	}
	
}

module.exports = new MyShopService();