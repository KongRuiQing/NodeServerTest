
var db = require('../mysqlproxy');
var newsfeed = require('./newsfeed');

exports.new_feed = function(data,player,callback){
	
	var content = data['content'];
	
	var images = data['images'];
	
	while(images.length < 8){
		images.push('');
	}
	for(var i = 0 ; i < images.length; ++i){
		images[i] = images[i].replace(/\\/g,"\\\\");
	}
	
	//check to do
	db.add_newsfeed(player.GetUserId(),content,images,function(success,content){
		var json_result = {};
		if(success){
			json_result['result'] = 0;
			
			newsfeed.add_newsfeed(content['newsfeed']);
		}else{
			json_result['result'] = 1;
		}
		callback(player,json_result,'new_feed');
	});
}