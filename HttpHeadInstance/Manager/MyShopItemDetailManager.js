'use strict';

var moment = require('moment');
var url=require('url');
var util = require('util');
var key = "if-modified-since";
var logger = require("../../logger.js").logger();
var Tag = "[MyShopItemDetailManager]"
class MyShopItemDetailManager{
	constructor(defaultTime){
		this.__map = {};
		this.__defaultTime = defaultTime;
	}
	changed(item_id){
		this.__map[item_id] = moment();
		logger.log("INFO",'MyShopItemDetailManager changed:',
			'item_id:',item_id,
			"value:",this.__map[item_id].format('YYYY-MM-DD HH:mm:ss.SSS'));
	}
	checkModified(req){
		let headers = req.headers;
		let query = url.parse(req.url,true).query;
		if('item_id' in query){
			let item_id = Number(query['item_id']);
			if(!(key in headers)){
				if(item_id in this.__map && this.__map[item_id] != undefined){
					
					return this.__map[item_id].format('YYYY-MM-DD HH:mm:ss.SSS');
				}else{
					logger.log("INFO",Tag,"check param:",
						'item_id :',item_id,
						'defaultTime:',this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'));

					return this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'); 
				}
			}else{
				
				let since_moment = moment(headers[key],'YYYY-MM-DD HH:mm:ss.SSS');
				if(item_id in this.__map){
					logger.log("INFO",Tag,
						'check param:',
						'since_moment:',since_moment.format('YYYY-MM-DD HH:mm:ss.SSS'),
						'item_id:',item_id,
						'this.__map[item_id]:',this.__map[item_id].format('YYYY-MM-DD HH:mm:ss.SSS'));
					if(since_moment.isBefore(this.__map[item_id],'millisecond')){
						return this.__map[item_id].format('YYYY-MM-DD HH:mm:ss.SSS');
					}
					return null;
				}else{
					logger.log("INFO",
						'CategoryCacheManager check param:',
						'since_moment:',since_moment.format('YYYY-MM-DD HH:mm:ss.SSS'),
						'item_id:',item_id,
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
	return new MyShopItemDetailManager(defaultTime);
}