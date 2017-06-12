'use strict';
var ShopService = require("./shop.js");
const EventEmitter = require('events');
var logger = require("../logger.js").logger();

class ShopAttentions extends EventEmitter {
	constructor() {
		super();
		
		ShopService.on("pass_pending_shop", (uid, shop_id) => {
			//logger.log("INFO","[ShopAttentions] event:pass_pending_shop","param:",uid,shop_id);
			//that.attentionShop(uid,shop_id,true);

			//logger.log("INFO","value:",that.__user_attention);
		});
		ShopService.on('to_pending_shop', (uid, shop_id) => {
			//logger.log("INFO","[ShopAttentions] event:to_pending_shop","param:",uid,shop_id);
			//that.attentionShop(uid,shop_id,false);
		});

		this.__user_attention = new Map(); // uid -> [...shop_id]

		this.__shop_attention = new Map(); // shop_id -> [...uid]
	}
	_updateUserAttentionInfo(uid, shop_id, is_attention) {
		if (is_attention) {
			if (this.__user_attention.has(uid)) {
				this.__user_attention.get(uid).add(shop_id);

			} else {
				let attention = new Set();
				attention.add(shop_id);
				this.__user_attention.set(uid, attention);
			}

		} else {
			if (this.__user_attention.has(uid)) {
				this.__user_attention.get(uid).delete(shop_id);
			}
		}
	}
	_updateShopAttentionInfo(uid, shop_id, is_attention) {
		if (is_attention) {
			if (this.__shop_attention.has(shop_id)) {
				this.__shop_attention.get(shop_id).add(uid);
			} else {
				let user = new Set();
				user.add(uid);
				this.__shop_attention.set(shop_id, user);
			}
		} else {

			if (this.__shop_attention.has(shop_id)) {
				this.__shop_attention.get(shop_id).delete(uid);
			}
		}
	}

	attentionShop(uid, shop_id, is_attention) {
		this._updateUserAttentionInfo(uid, shop_id, is_attention);
		this._updateShopAttentionInfo(uid, shop_id, is_attention);

		this.emit('event_attention_shop',shop_id,is_attention);
	}

	getAttentionShops(uid) {

		if (this.__user_attention.has(uid)) {

			return this.__user_attention.get(uid).values();
		}
		//logger.log("INFO",)
		return [];
	}

	isAttentionThisShop(uid, shop_id) {
		if (this.__user_attention.has(uid)) {
			let attention = this.__user_attention.get(uid);
			return attention.has(shop_id);
		}
		return false;
	}
	getShopAttentionNum(shop_id) {
		if (this.__shop_attention.has(shop_id)) {
			return this.__shop_attention.get(shop_id).size;
		}
		return 0;
	}
}
let _instance = new ShopAttentions();

module.exports = _instance;