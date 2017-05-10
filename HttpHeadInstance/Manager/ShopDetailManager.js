'use strict';

var moment = require('moment');
var url=require('url');
var util = require('util');
var key = "if-modified-since";
var logger = require("../../logger.js").logger();
var Tag = "[MyShopItemDetailManager]"
class ShopDetailManager{
	constructor(defaultTime){
		this.__map = new Map();
		this.__defaultTime = defaultTime;
	}
	changed(shop_id){
		this.__map.set(Number(shop_id),moment());
		
	}
	checkModified(req){
		let headers = req.headers;
		let query = url.parse(req.url,true).query;

		if('shop_id' in query){
			let shop_id = Number(query['shop_id']);
			if(!(key in headers)){
				if(shop_id in this.__map && this.__map.has(shop_id) != undefined){
					
					return this.__map.get(shop_id).format('YYYY-MM-DD HH:mm:ss.SSS');
				}else{
					logger.log("INFO",Tag,"check param:",
						'shop_id :',shop_id,
						'defaultTime:',this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'));

					return this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'); 
				}
			}else{
				
				let since_moment = moment(headers[key],'YYYY-MM-DD HH:mm:ss.SSS');
				if(this.__map.has(shop_id)){
					logger.log("INFO",Tag,
						'check param:',
						'since_moment:',since_moment.format('YYYY-MM-DD HH:mm:ss.SSS'),
						'shop_id:',shop_id,
						'this.__map[shop_id]:',this.__map.get(shop_id).format('YYYY-MM-DD HH:mm:ss.SSS'));
					if(since_moment.isBefore(this.__map.get(shop_id),'millisecond')){
						return this.__map.get(shop_id).format('YYYY-MM-DD HH:mm:ss.SSS');
					}
					return null;
				}else{
					logger.log("INFO",
						'CategoryCacheManager check param:',
						'since_moment:',since_moment.format('YYYY-MM-DD HH:mm:ss.SSS'),
						'shop_id:',shop_id,
						'this.__defaultTime:',this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'));
					
					if(since_moment.isBefore(this.__defaultTime,'millisecond')){
						return this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS');
					}
					return null;
				}
			}
		}
		return null;

	}

}

module.exports = function(defaultTime){
	return new ShopDetailManager(defaultTime);
}