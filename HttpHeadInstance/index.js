'use strict'
var moment = require('moment');

function HeadInstance(){
	this.map = {};
	this.defaultTime = moment(Date.now());
}

HeadInstance.prototype.checkModified = function(url,since){
	//console.log(since);
	if(since == null){
		if(url in this.map){
			return this.map[url].format('YYYY-MM-DD HH:mm:ss.SSS');
		}else{
			return this.defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS');
		}
	}else{
		//console.log(since);
		let since_moment = moment(since);
		//console.log("AAAA",since,since_moment.valueOf());
		if(url in this.map){
			if(since_moment.isBefore(this.map[url],"millisecond")){
				return this.map[url].format('YYYY-MM-DD HH:mm:ss.SSS');
			}else{
				return null;
			}
		}else{
			//console.log(since,"<",this.defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS'));
			//console.log(since_moment.valueOf(),"<>",this.defaultTime.valueOf());
			if(since_moment.isBefore(this.defaultTime,"millisecond")){
				//console.log("CCCC");
				return this.defaultTime.format('YYYY-MM-DD HH:mm:ss.SSS');
			}else{
				//console.log("DDDD");
				return null;
			}
		}
	}
}
HeadInstance.prototype.setModified = function(url,modified_time){
	this.map[url] = modified_time;
}

var instnce = new HeadInstance();

exports.getInstance = function(){
	return instnce;
}