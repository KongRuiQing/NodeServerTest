var db = require('../mysqlproxy');

exports.find_player = function(data,player,callback){
	
	db.db_find_friend(data['FindText'],player.GetUserId(),function(success,content){
			if(success){
				callback(player,content,'find_player')
			}else{
				console.log("friend.find_player Error");
			}
	});
}

exports.be_friend = function(data,player,callback){
	if(parseInt(data['friend_id']) <=  0){
		return;
	}
	db.db_be_friend(data['friend_id'],player.GetUserId(),function(success,content){

		if(success){
			callback(player,{'result':1},'be_friend')
		}else{
			callback(player,{'result' : 0,'success' : content.success},'be_friend')
		}
	});
}

exports.query_be_friend_list = function(data,player,callback){
	if(parseInt(data['Query']) == 1){
		db.query_be_friend_list(player.GetUserId(),function(success,content){
			var json_result = {};
			if(success){
				json_result['result'] = 0;
				// operator
				json_result['list'] = content;
			}else{
				json_result['result'] = 2;
			}
			callback(player,{})
		});
	}else{
		callback(player,{'result':1});
	}
	
}