'use strict'
var moment = require('moment');
var events = require('events');
var util = require('util');
var logger = require("../logger.js").logger();

var key = "if-modified-since";
var url=require('url');
var AdCacheManager = require('./Manager/AdCacheManager.js');
var CategoryCacheManager = require('./Manager/CategoryCacheManager.js');

class ReadyBeSellerDataMoniter{
	constructor(defaultTime){
		this.__map = {};
		this.__defaultTime = defaultTime;
	};
	checkModified(req){
		return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
	} 
}

class ShopListDataMoniter{
	constructor(defaultTime){
		this.__defaultTime = defaultTime;
	}
	checkModified(req){
		return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
	}
};




function HeadInstance(){

	this.defaultTime = moment();

	this.__custom_map = {
		'/get_ready_be_seller_data' : new ReadyBeSellerDataMoniter(this.defaultTime),
		'/shop_list' : new ShopListDataMoniter(this.defaultTime),
		'/ad_image' : AdCacheManager(this.defaultTime),
		'/category' : CategoryCacheManager(this.defaultTime),
	};
	this.map = {};

	events.EventEmitter.call(this);
}

util.inherits(HeadInstance, events.EventEmitter);


HeadInstance.prototype.checkModified = function(req){
	let query = url.parse(req.url,true).query;
	
	
	let request_url = url.parse(req.url,true);
	let pathname = request_url.pathname;
	var headers = req.headers;
	logger.log("INFO","headers:",util.inspect(headers));

	if(pathname in this.__custom_map){
		return this.__custom_map[pathname].checkModified(req);

	}else if(pathname in this.map){
		let since_moment = null;
		if(key in headers){
			since_moment = moment(headers[key]);
		}
		if(since_moment == null){
			return this.map[pathname].format('YYYY-MM-DD HH:mm:ss.SSS'); 
		}else{
			let last_modify_moment = this.map[pathname];

			if(since_moment.isBefore(last_modify_moment,'millisecond')){
				return last_modify_moment.format('YYYY-MM-DD HH:mm:ss.SSS'); 
			}

			return null;
		}
	}else{
		
		this.map[pathname] = this.defaultTime;
		return this.defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'); 
	}
}

HeadInstance.prototype.getObj = function(obj_name){
	if(obj_name in this.__custom_map){
		return this.__custom_map[obj_name];
	}
	return null;
}



var instnce = new HeadInstance();

instnce.on('/admin/v1/ad',function(position){
	let obj = instnce.getObj('/ad_image');
	if(obj != null){
		obj.changed(position);
	}
});
instnce.on('/category',function(type){
	let obj = instnce.getObj('/category');
	if(obj != null){
		obj.changed(type);
	}
});

exports.getInstance = function(){
	return instnce;
}