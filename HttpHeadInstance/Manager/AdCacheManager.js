'use strict';
var moment = require('moment');
var url=require('url');

var key = "if-modified-since";

class AdCacheManager{
	constructor(defaultTime){
		this.__map = {};
		this.__defaultTime = defaultTime;
	}
	changed(position){
		this.__map[position] = moment(Date.now());
	}
	checkModified(req){
		let headers = req.headers;
		let query = url.parse(req.url,true).query;
		
		if('position' in query){
			let position = Number(query['position']);
			if(!(key in headers)){
				if(position in this.__map && this.__map[position] != undefined){
					
					return this.__map[key].format('YYYY-MM-DD HH:mm:ss.SSS');
				}else{
					return this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'); 
				}
			}else{
				console.log(headers[key]);
				let since_moment = moment(headers[key],'ddd,DD MMM YYYY HH:mm:ss ZZ');
				if(position in this.__map){
					if(since_moment.isBefore(this.__map[position],'millisecond')){
						return this.__map[position].format('YYYY-MM-DD HH:mm:ss.SSS');
					}
					return null;
				}else{
					if(since_moment.isBefore(this.__defaultTime,'millisecond')){
						return this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS');
					}else{
						return null;
					}
				}
			}
		}
		return null;

	}

}

module.exports = function(defaultTime){
	return new AdCacheManager(defaultTime);
}