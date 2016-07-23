
var db = require('../mysqlproxy');
var newsfeed = require('./newsfeed');

exports.new_feed = function(data,player,callback){
	
	var text = data['content'];
	var images = data['images'];
	
	while(images.length < 8){
		images.push('');
	}
	for(var i = 0 ; i < images.length; ++i){
		images[i] = images[i].replace(/\\/g,"\\\\");
	}
	
	//check to do
	db.add_newsfeed(player.GetUserId(),text,images,function(success,content){
		var json_result = {};
		if(success){
			json_result['result'] = 0;
			
			newsfeed.add_newsfeed(content[0]);
		}else{
			json_result['result'] = 1;
		}
		callback(player,json_result,'new_feed');
	});
}

exports.player_detail = function(query,player,callback){
	callback(player,{},"player_detail");
}