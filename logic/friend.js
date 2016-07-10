var db = require('../mysqlproxy');

g_relation = {};

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
		db.query_be_friend_list(player.GetUserId(),data['LastTime'],function(success,content){
			var json_result = {};
			if(success){
				json_result['result'] = 0;
				// operator
				json_result['list'] = content;
			}else{
				json_result['result'] = 2;
			}
			callback(player,json_result,"query_be_friend_list")
		});
	}else{
		callback(player,{'result':1},"query_be_friend_list");
	}
	
}

exports.agree_be_friend = function(data,player,callback){

	var fid = parseInt(data['friend_id']);

	var json_result = {"method":"agree"};

	if(fid > 0){
		db.agree_be_friend(fid, player.GetUserId(), function(success,content){
			
			if(success){
				if(content["result"]){
					json_result['result'] = 0;
					json_result['friend_id'] = fid;
					json_result['friend_info'] = content['info'];
					var friend = g_playerlist.findPlayerByAccount(fid);
					if(friend != undefined){
						friend.SendAgreeBeFriend(player.GetUserId());
					}
				}else{
					json_result['result'] = 1;
				}
			}else{
				json_result['result'] = 2;
			}
			callback(player,json_result,"agree_be_friend");
		});
	}else{
		json_result["result"] = 3;
		callback(player,json_result,"agree_be_friend");
	}

};

exports.friend_list = function(data,player,callback){

	//console.log(data);

	db.query_friend_list(player.GetUserId(),function(success,content){

		var json_result = {};
		if(success){
			json_result['result'] = 0;
			json_result['friend_list'] = [];
			var friend_list = content['friend_list'];
			for(var i in friend_list){
				json_result['friend_list'].push(friend_list[i])
			}
		}else{
			json_result['result'] = 1;
		}
		callback(player,json_result,"friend_list");
	});
};

exports.get_feed_list = function(data,player,callback){
	
};

exports.isFriend = function(uid,fid){
	uid = parseInt(uid);
	fid = parseInt(fid);

	if(fid < uid){
		var a = uid;
		uid = fid;
		fid = a;
	}
	if(g_relation[uid] == null || g_relation[uid] == undefined){
		return false;
	}else{
		for(var i in g_relation[uid]){
			if(g_relation[uid][i]['fid'] == fid){
				return true;
			}
		}
		return false;
	}
}

exports.init_friend_relation = function(content){
	for(var i in content){

		var uid = parseInt(content[i]['uid']);
		var fid = parseInt(content[i]['fid']);
		var nick = content[i]['remark'];
		if(g_relation[uid] == null || g_relation[uid] == undefined){
			g_relation[uid] = [{'fid':fid,'nick':nick}];
		}else{
			g_relation[uid].push({'fid':fid,'nick':nick});
		}
	}
}