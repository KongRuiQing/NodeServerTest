
var db = require('../mysqlproxy');
var newsfeed = require('./newsfeed');
var userinfo = require("../userinfo");
var logger = require('../logger').logger();
exports.my_feed_list = function(query,player,callback){

	var feeds = newsfeed.find_myfeed(player.GetUserId());

	var json_result = {};

	if(feeds == null || feeds == undefined){
		json_result['result'] = 0;
		json_result['uid'] = player.GetUserId();
		json_result['page'] = page;
		json_result['feeds'] = [];
	}else{
		
		var page = parseInt(query['page']);
		json_result['result'] = 0;
		json_result['uid'] = player.GetUserId();
		json_result['page'] = page;
		json_result['feeds'] = [];
		var len = feeds.length;
		for(var i = len - 1; i >= 0; --i){
			var index = len - 1 - i;
			if(index < page * 20){
				if(index >= (page - 1) * 20){
					var json_value = feeds[i].toJsonValue();
					json_result['feeds'].push(json_value);
				}
			}else{
				break;
			}
		}
	}
	
	callback(player,json_result,"my_feed_list");
}