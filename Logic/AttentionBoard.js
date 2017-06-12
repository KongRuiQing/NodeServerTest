'use strict';
var logger = require("../logger.js").logger();

var Attentions = require("./Attentions.js");

class AttentionBoard {
	constructor() {

		this.__attention_map = new Map();
		this.__cache = null;
		let that = this;
		Attentions.on('event_attention_shop',(shop_id,is_attention)=>{
			logger.log('INFO','AttentionBoard on event_attention_shop',shop_id,is_attention);
			that.onAttentionChange(shop_id,is_attention);
		});
	}

	onAttentionChange(shop_id,is_attention){
		if(is_attention){
			this.addShopAttentionNum(shop_id);
		}else{
			this.removeShopAttentionNum(shop_id);
		}
		this.__cache = null;
	}

	addShopAttentionNum(shop_id) {
		if (this.__attention_map.has(shop_id)) {
			let num = this.__attention_map.get(shop_id);
			this.__attention_map.set(shop_id, num + 1);
		} else {
			this.__attention_map.set(shop_id, 1);
		}
	}
	removeShopAttentionNum(shop_id) {
		if (this.__attention_map.has(shop_id)) {
			let num = this.__attention_map.get(shop_id);
			this.__attention_map.set(shop_id, num - 1);
		}
	}
	getAttentionBoard() {
		let that = this;
		if (this.__cache == null) {
			this.__cache = [];
			this.__attention_map.forEach((num, shop_id) => {
				that.__cache.push({
					'shop_id': shop_id,
					'num': num,
				})
			});

			this.__cache.sort((a, b) => {
				return b.num - a.num;
			});
		}

		return this.__cache;
	}



}

let _instance = new AttentionBoard();

module.exports = _instance;