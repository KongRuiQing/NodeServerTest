'use strict';

var moment = require('moment');
var url=require('url');
var util = require('util');
var key = "if-modified-since";
var logger = require("../../logger.js").logger();
class CategoryCacheManager{
	constructor(defaultTime){
		this.__map = {};
		this.__defaultTime = defaultTime;
	}
	changed(type){
		this.__map[type] = moment();
		logger.log("INFO",'CategoryCacheManager changed:',
			'type:',type,
			"value:",this.__map[type].format('YYYY-MM-DD HH:mm:ss.SSS'));
	}
	checkModified(req){
		let headers = req.headers;
		let query = url.parse(req.url,true).query;
		if('type' in query){
			let type = Number(query['type']);
			if(!(key in headers)){
				if(type in this.__map && this.__map[type] != undefined){
					logger.log("INFO",
						"CategoryCacheManager check param:",
						'type = ',type,
						"this.__map[type]:",this.__map[type].format('YYYY-MM-DD HH:mm:ss.SSS'));

					return this.__map[type].format('YYYY-MM-DD HH:mm:ss.SSS');
				}else{
					logger.log("INFO","CategoryCacheManager check param:",
						'type :',type,
						'defaultTime:',this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'));

					return this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'); 
				}
			}else{
				
				let since_moment = moment(headers[key],'YYYY-MM-DD HH:mm:ss.SSS');
				if(type in this.__map){
					logger.log("INFO",
						'CategoryCacheManager check param:',
						'since_moment:',since_moment.format('YYYY-MM-DD HH:mm:ss.SSS'),
						'type:',type,
						'this.__map[type]:',this.__map[type].format('YYYY-MM-DD HH:mm:ss.SSS'));
					if(since_moment.isBefore(this.__map[type],'millisecond')){
						return this.__map[type].format('YYYY-MM-DD HH:mm:ss.SSS');
					}
					return null;
				}else{
					logger.log("INFO",
						'CategoryCacheManager check param:',
						'since_moment:',since_moment.format('YYYY-MM-DD HH:mm:ss.SSS'),
						'type:',type,
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
	return new CategoryCacheManager(defaultTime);
}