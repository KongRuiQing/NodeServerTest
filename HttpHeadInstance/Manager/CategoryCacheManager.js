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
		this.__map[type] = moment().utc();
	}
	checkModified(req){
		let headers = req.headers;
		let query = url.parse(req.url,true).query;
		if('type' in query){
			let type = Number(query['type']);
			if(!(key in headers)){
				logger.log("INFO","CategoryCacheManager param:",'type:',type,",map:",util.inspect(this.__map));
				if(type in this.__map && this.__map[type] != undefined){
					//logger.log("INFO","CategoryCacheManager check param:",'type = ',type,"this.__map[type]:",this.__map[key].format('YYYY-MM-DD HH:mm:ss.SSS'));
					return this.__map[key].format('YYYY-MM-DD HH:mm:ss.SSS');
				}else{
					//logger.log("INFO","CategoryCacheManager check param:",)
					return this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'); 
				}
			}else{
				
				let since_moment = moment(headers[key],'YYYY-MM-DD HH:mm:ss.SSS');
				logger.log("INFO",
					"CategoryCacheManager param:",
					'type:',type,
					'defaultTime:',this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'),
					"map:",util.inspect(this.__map),
					'if-modified-since:',since_moment.format('YYYY-MM-DD HH:mm:ss.SSS')
					);

				if(type in this.__map){
					if(since_moment.isBefore(this.__map[type],'millisecond')){
						return this.__map[type].format('YYYY-MM-DD HH:mm:ss.SSS');
					}
					return null;
				}else{

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