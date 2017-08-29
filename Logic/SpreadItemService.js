'use strict';
var logger = require("../logger.js").logger();
var moment = require("moment");
var _db = require("../db_sequelize");
var FindUtil = require("../FindUtil.js");
var DbCache = require("../cache/DbCache.js");
var ShopCache = require("../cache/shopCache.js")

var ShopItemEventDispatcher = require("../EventDispatcher/ShopItemEventDispatcher.js");
var ShopEventDispatcher = require("../EventDispatcher/ShopEventDispatcher.js");
class SpreadItemBean {
	constructor(db_row) {
		this.image = null;
		this.setItem(db_row);
	}

	setItem(db_row) {
		//logger.log("INFO","db_row:",db_row);
		this.item_name = db_row['name'];
		this.item_price = parseFloat(db_row['price']);
		this.item_show_price = parseFloat(db_row['show_price']);
		this.item_id = Number(db_row['id']);
		this.shop_id = Number(db_row['shop_id']);
		this.created_time = moment(db_row['createdAt']).unix();
		this.category_code = Number(db_row['category_code']);
	}

	setImage(db_image) {
		let image = db_image['image'];
		let index = db_image['index'];
		let image_type = Number(db_image['image_type']);
		//logger.log("INFO","[SpreadItemService]setImage param:",db_image);
		if (this.image == null) {
			if (image_type == 1) {
				this.image = image;
			}
		} else {
			if (image_type == 1 && index == 1) {
				this.image = image;
			}
		}
		//logger.log("INFO","[SpreadItemService]setImage result:",this.image);
	}
	getItemId() {
		return this.item_id;
	}
	getShopId() {
		return this.shop_id;
	}

	match(query) {
		if (query['keyword'] != null && query['keyword'].length > 0) {
			if (this.item_name.indexOf(keyword) < 0) {
				return false;
			}
		}
		if (query['category_code'] > 0) {
			let match_category = DbCache.getInstance().matchCategor(query['category_code'], this.category_code, "item");
			if (!match_category) {
				return false;
			}
		}
		return true;
	}


}

class SpreadShopBean {
	constructor(db_row) {
		this.shop_id = Number(db_row['Id']);
		this.longitude = parseFloat(db_row['longitude']);
		this.latitude = parseFloat(db_row['latitude']);
		this.city_no = Number(db_row['city_no']);
		this.area_code = Number(db_row['area_code']);
	}
	getDistance(inLongitude, inLatitude) {
		logger.log("INFO", inLatitude, inLongitude, this.latitude, this.longitude);
		return FindUtil.getFlatternDistance(
			Number(inLatitude), Number(inLongitude), Number(this.latitude), Number(this.longitude));
	}
	getShopId() {
		return this.shop_id;
	}
	match(query) {
		if (query['city_no'] != 0) {
			if (query['city_no'] != this.city_no) {
				return false;
			}
		}
		if (query['area_code'] != 0) {
			if (query['area_code'] == this.area_code) {
				return false;
			}
		}
		let distance = this.getDistance(query['longitude'], query['latitude']);
		if (query['distance'] > 0) {

			if (distance > query['distance']) {
				return false;
			}
		}

		if (distance <= query['last_distance']) {
			return false;
		}

		return true;
	}
}

class Query {
	constructor() {
		this.longitude = 0.0;
		this.latitude = 0.0;
		this.city_no = 0;
		this.area_code = 0;
		this.keyword = "";
		this.distance = -1;
		this.last_distance = 0;

		this.requestFlag = 0;
	}

	withLongitude(longitude) {
		this.longitude = longitude;
		this.requestFlag |= 0x1;
		return this;
	}
	withLatitude(latitude) {
		this.latitude = latitude;
		this.requestFlag |= 0x2;
		return this;
	}
	withCity(city_no) {
		this.city_no = city_no;
		this.requestFlag |= 0x4;
		return this;
	}
	withArea(area_code) {
		this.area_code = area_code;
		this.requestFlag |= 0x8;
		return this;
	}
	withSearch(keyword) {
		this.keyword = keyword;
		this.requestFlag |= 0x16;
		return this;
	}
	withDistance(distance) {
		this.distance = distance;
		this.requestFlag |= 0x32;
		return this;
	}
	withLastDistance(last_distance) {
		this.last_distance = last_distance;
		this.requestFlag |= 0x64;
		return this;
	}

	isBad() {
		return (this.requestFlag & 0x7) != 0x7;
	}
}

class SpreadItemService {
	constructor() {
		this.__item = new Map();

		this.__shop = new Map();


		this.bindEvent();

	}

	registerSpreadItemInfo(db_item) {
		let bean = new SpreadItemBean(db_item);
		this.__item.set(bean.getItemId(), bean);
	}
	registerSpreadItemImage(db_item) {
		let item_id = Number(db_item['item_id']);
		if (this.__item.has(item_id)) {
			this.__item.get(item_id).setImage(db_item);
		}
	}

	registerShopInfo(db_shop) {
		let bean = new SpreadShopBean(db_shop);
		this.__shop.set(bean.getShopId(), bean);
	}

	buildQuery() {
		return new Query();
	}


	getItemList(query) {
		//logger.log("INFO","[SpreadItemService] start getItemList");
		if (query.isBad()) {
			logger.log("ERROR", "get spread item list query is bad %d", query['requestFlag']);
			return [];
		}
		let item_list = this.__item.values();

		let cache = [];

		for (let item of item_list) {

			let shop = this.__shop.get(item.getShopId());

			if (shop == null) {
				logger.log("ERROR", "[SpreadItemService]getItemList shop is not exist");
				continue;
			}


			if (!shop.match(query)) {
				//logger.log("ERROR","[SpreadItemService]getItemList shop is not match");
				continue;
			}


			if (!item.match(query)) {
				//logger.log("ERROR","[SpreadItemService]getItemList item is not match");
				continue;
			}

			cache.push({
				'distance': shop.getDistance(query['longitude'], query['latitude']),
				'image': item.image,
				'item_name': item.item_name,
				'item_price': item.item_price,
				'item_show_price': item.item_show_price,
				'item_id': item.item_id,
				'shop_id': item.shop_id,
				'created_time': item.created_time,
			});
		}

		cache.sort((left, right) => {
			if (left['shop_id'] == right['shop_id']) {
				return right['created_time'] - left['created_time'];
			}
			return left['distance'] - right['distance'];
		});

		return cache;

	}

	bindEvent() {
		let that = this;
		ShopItemEventDispatcher.bindEvent('off_shelve_item_list', (item_id_list) => {
			that._offShelveItem(item_id_list);
		});
		ShopItemEventDispatcher.bindEvent("shelve_item_list", (item_list) => {
			that._ShelveItem(item_list);
		});
		ShopItemEventDispatcher.bindEvent("remove_shop_item", (item_id) => {
			that._offShelveItem([item_id]);
		});

		ShopItemEventDispatcher.bindEvent("refresh_shop_item", (item) => {
			logger.log("INFO","[SpreadItemService] refresh_shop_item");
			that._refreshShopItem(item);
		});

		ShopEventDispatcher.bindEvent("close_shop", (shop_id) => {
			that._removeItemByShop(shop_id);
		});
		ShopEventDispatcher.bindEvent("pass_pending_shop", (shop_id) => {
			logger.log("INFO","[SpreadItemService] pass_pending_shop shop_id:",shop_id);
			let shop = ShopCache.getInstance().getShop(shop_id);
			if(shop != null){
				that._addShopInfo(shop);
			}
		});
	}
	_offShelveItem(item_id_list) {
		if (item_id_list == null) {
			return;
		}
		logger.log("INFO", "[SpreadItemService]_offShelveItem item_id_list:", item_id_list);
		for (let item_id of item_id_list) {
			logger.log("INFO", "[SpreadItemService]_offShelveItem item_id:", item_id);
			this.__item.delete(Number(item_id));
		}
	}



	_ShelveItem(item_with_shop) {
		logger.log("INFO", "[SpreadItemService]_ShelveItem")
		if (item_with_shop == null) {
			return;
		}
		let item_list = item_with_shop['items'];
		//logger.log("INFO", "[SpreadItemService]_ShelveItem ",item_with_shop);
		for (let item of item_list) {
			let item_json = {
				"name": item.getName(),
				"price": item.getPrice(),
				"show_price": item.getShowPrice(),
				"id": item.getId(),
				"shop_id": item.getShopId(),
				"createdAt": item.getCreatedTime(),
				"category_code": item.getCategoryCode(),
			};
			
			let bean = new SpreadItemBean(item_json);
			
			let image_json = {
				'image': item.getFirstShowImage(),
				'index': 1,
				'image_type': 1
			}
			bean.setImage(image_json);

			this.__item.set(bean.getItemId(), bean);
		}
		let shop = item_with_shop['shop'];

		let shop_json = {
			'Id': shop.getId(),
			'longitude': shop.getLongitude(),
			'latitude': shop.getLatitude(),
			'city_no': shop.getCity(),
			'area_code': shop.getAreaCode(),
		}
		this.registerShopInfo(shop_json);
	}

	_removeItemByShop(shop_id) {
		this.__shop.delete(shop_id);
		let item_id_list = [];
		this.__item.forEach((item, item_id) => {
			if (item.getShopId() == shop_id) {
				item_id_list.push(item_id);
			}
		}, this);

		for (let item_id of item_id_list) {
			this.__item.delete(item_id);
		}
	}

	_refreshShopItem(item) {
		if (this.__item.has(item.getId())) {
			let item_json = {
				"name": item.getName(),
				"price": item.getPrice(),
				"show_price": item.getShowPrice(),
				"id": item.getId(),
				"shop_id": item.getShopId(),
				"createdAt": item.getCreatedTime(),
				"category_code": item.getCategoryCode(),
			};
			let bean = this.__item.get(item.getId());
			bean.setItem(item_json);
			let image_json = {
				'image': item.getFirstShowImage(),
				'index': 1,
				'image_type': 1
			}
			bean.setImage(image_json);
			logger.log("INFO","[SpreadItemService]_refreshShopItem bean:",bean);
		}
	}
	_addShopInfo(shop) {
		logger.log("INFO","[SpreadItemService] _addShopInfo");
		let shop_json = {
			'Id': shop.getId(),
			'longitude': shop.getLongitude(),
			'latitude': shop.getLatitude(),
			'city_no': shop.getCity(),
			'area_code': shop.getAreaCode(),
		}
		logger.log("INFO","[SpreadItemService] _addShopInfo ",shop_json);
		this.registerShopInfo(shop_json);
	}
}

module.exports = new SpreadItemService();