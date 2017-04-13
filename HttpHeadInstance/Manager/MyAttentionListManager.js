'use strict';

var moment = require('moment');
var url=require('url');
var util = require('util');
var key = "if-modified-since";
var logger = require("../../logger.js").logger();
var Tag = "[MyAttentionListManager]"
class MyAttentionListManager{
	constructor(defaultTime){
		this.__map = {};
		this.__defaultTime = defaultTime;
	}
	changed(uid){
		this.__map[uid] = moment();
		logger.log("INFO",'MyAttentionListManager changed:',
			'uid:',uid,
			"value:",this.__map[uid].format('YYYY-MM-DD HH:mm:ss.SSS'));
	}
	checkModified(req){
		let headers = req.headers;
		let query = url.parse(req.url,true).query;
		if('uid' in headers){
			let uid = Number(headers['uid']);

			if(!(key in headers)){
				if(uid in this.__map && this.__map[uid] != undefined){
					
					return this.__map[uid].format('YYYY-MM-DD HH:mm:ss.SSS');
				}else{
					logger.log("INFO",Tag,"check param:",
						'uid :',uid,
						'defaultTime:',this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'));

					return this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'); 
				}
			}else{
				
				let since_moment = moment(headers[key],'YYYY-MM-DD HH:mm:ss.SSS');
				if(uid in this.__map){
					logger.log("INFO",Tag,
						'check param:',
						'since_moment:',since_moment.format('YYYY-MM-DD HH:mm:ss.SSS'),
						'uid:',uid,
						'this.__map[uid]:',this.__map[uid].format('YYYY-MM-DD HH:mm:ss.SSS'));
					if(since_moment.isBefore(this.__map[uid],'millisecond')){
						return this.__map[uid].format('YYYY-MM-DD HH:mm:ss.SSS');
					}
					return null;
				}else{
					logger.log("INFO",
						'CategoryCacheManager check param:',
						'since_moment:',since_moment.format('YYYY-MM-DD HH:mm:ss.SSS'),
						'uid:',uid,
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
	return new MyAttentionListManager(defaultTime);
}