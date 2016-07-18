
var db = require('../mysqlproxy');
var newsfeed = require('./newsfeed');

exports.my_feed_list = function(query,player,callback){

	var feeds = newsfeed.find_myfeed(player.GetUserId());
	var json_result = {};

	if(feeds == null || feeds == undefined){
		json_result['result'] = 0;
		json_result['uid'] = player.GetUserId();
		json_result['page'] = page;
		json_result['feeds'] = [];
	}else{
		var index = 0;
		var page = parseInt(query['page']);
		json_result['result'] = 0;
		json_result['uid'] = player.GetUserId();
		json_result['page'] = page;
		json_result['feeds'] = [];
		for(var i in feeds){
			if(index < index * 20){
				if(index >= (index - 1) * 20){
					var json_value = feeds[i].toJsonValue();
					json_result['feeds'].push(json_value);
				}
			}else{
				break;
			}
			index = index + 1;
		}
	}
	
	callback(player,json_result,"my_feed_list");
}