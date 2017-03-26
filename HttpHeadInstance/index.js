'use strict'
var moment = require('moment');
var events = require('events');
var util = require('util');

class ReadyBeSellerDataMoniter{
	constructor(defaultTime){
		this.__last_modify = {};
		this.__defaultTime = defaultTime;
	};
	checkModified(query,head,since){
		let uid = head['uid'];
		if(uid > 0){
			if(since == null){
				if(uid in this.__last_modify){
					let last_modify_moment = this.__last_modify[uid];
					return last_modify_moment.format('YYYY-MM-DD HH:mm:ss.SSS'); 
				}else{

					this.__last_modify[uid] = this.__defaultTime;
					return this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'); 
				}
			}else{
				let since_moment = moment(since);
				if(uid in this.__last_modify){
					let last_modify_moment = this.__last_modify[uid];
					if(since_moment.isBefore(last_modify_moment,'millisecond')){
						return last_modify_moment.format('YYYY-MM-DD HH:mm:ss.SSS');
					}else{
						return null;
					}
				}else{
					this.__last_modify[uid] = this.__defaultTime;
					return this.__defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS');
				}
			}
		}
		return null;
	} 
	changeModify(uid,modified_time){
		this.__last_modify[uid] = moment(modified_time);
	}
}

class ShopListDataMoniter{
	constructor(){}
	checkModified(query,head,since){
		let now_moment = moment(Date.now());
		if(since == null){
			return now_moment.format('YYYY-MM-DD HH:mm:ss.SSS');
		}else{
			let since_moment = moment(since);
			let diff = now_moment.diff(since_moment);
			if(diff >= 3*1000){
				return now_moment.format('YYYY-MM-DD HH:mm:ss.SSS');
			}
			return null;
			
		}
	}
};

function ShopClaimState(){
	this.checkModified = function(query,head,since){
		let now_moment = moment(Date.now());
		return now_moment.format('YYYY-MM-DD HH:mm:ss.SSS');
	}
}

function HeadInstance(){

	this.defaultTime = moment(Date.now());

	this.__custom_map = {
		'/get_ready_be_seller_data' : new ReadyBeSellerDataMoniter(this.defaultTime),
		'/shop_list' : new ShopListDataMoniter(),
		'/shop_claim_state' : new ShopClaimState()
	};
	this.map = {};

	events.EventEmitter.call(this);
}

util.inherits(HeadInstance, events.EventEmitter);


HeadInstance.prototype.checkModified = function(url,head,since){
	
	let pathname = url.pathname;
	let query = url.query;

	if(pathname in this.__custom_map){
		return this.__custom_map[pathname].checkModified(query,head,since);

	}else if(pathname in this.map){
		if(since == null){
			return this.map[pathname].format('YYYY-MM-DD HH:mm:ss.SSS'); 
		}else{
			let since_moment = moment(since);
			let last_modify_moment = this.map[pathname];
			if(since_moment.isBefore(last_modify_moment,'millisecond')){
				return last_modify_moment.format('YYYY-MM-DD HH:mm:ss.SSS'); 
			}else{
				return null;
			}
		}
	}else{
		console.log("pathname" , pathname,' since:',since);
		this.map[pathname] = this.defaultTime;
		return this.defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'); 
	}
}
HeadInstance.prototype.setModified = function(url,modified_time){
	this.map[url] = modified_time;
}

var instnce = new HeadInstance();

instnce.on('/get_ready_be_seller_data',function(uid){
	if(instnce != null){
		if('/get_ready_be_seller_data' in instnce.__custom_map){
			instnce.__custom_map['/get_ready_be_seller_data'].changeModify(uid,Date.now());
		}
	}
});

instnce.on('shop_claim',function(shop_id){

});

exports.getInstance = function(){
	return instnce;
}