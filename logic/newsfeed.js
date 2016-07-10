var db = require('../mysqlproxy');
var friend = require('./friend');
var util = require('util');

// newsfeed_id newsfeed
g_newsfeed = {};


function newsfeed_comment(json_value){
	this.id = json_value['id'];
	this.uid = json_value['uid'];
	this.reply_id = json_value['reply_id'];
	this.newsfeed_id = json_value['newsfeed_id'];
	this.text = json_value['text'];
	this.public_time = json_value['public_time'];
}


function friend_newsfeed(json_value){
	
	this.id = json_value['id'];
	this.text = json_value['content'] || "";

	this.images = json_value['images'];
	this.public_time = json_value['public_time'];
	this.uid = json_value['uid'];
	this.comment = [];
}

friend_newsfeed.prototype.add_comment = function(json_value){
	this.comment.push(new newsfeed_comment(json_value))
}

exports.add_newsfeed = function(json_value){
	var uid = json_value['uid'];
	if(g_newsfeed[uid] == null || g_newsfeed[uid] == undefined){
		g_newsfeed[uid] = [new friend_newsfeed(json_value)];
	}else{
		g_newsfeed[uid].push(new friend_newsfeed(json_value));
	}
}



exports.del_newsfeed = function(id) {

}


exports.get_feed_list = function(data,player,callback){

	db.fetch_all_friend(player.GetUserId(),function(success,content){

		var friend_list = content['friend_list'];
		
		var newsfeed_list = [];
		var uid = player.GetUserId();

		for( var i in friend_list){
			var id = friend_list[i]["id"];
			//g_newsfeed[id]['name'] = friend_list[i]["name"];
			if(id != undefined && g_newsfeed[id] != undefined){
				newsfeed_list = newsfeed_list.concat(g_newsfeed[id]['newsfeed_list']);
			}
		}
		//console.log(util.inspect(newsfeed_list));
		// 按时间排序 
		newsfeed_list = newsfeed_list.sort(function(a,b){
			if(a['public_time'] > b['public_time']){
				return -1;
			}
			else{
				return 1;
			}

		});


		var page = data['page'];

		var inpage = function(index,page){
			var page_size = 20;
			page = page > 0? page:1;
			if(i >= (page - 1) * page_size && i< page * page_size){
				return true;
			}
			return false;
		};

		var isVisibility = function(uid,comment){
			if(friend.isFriend(uid,comment['uid'])){
				if(comment['reply_id'] != null && comment['reply_id'] != undefined){
					if(friend.isFriend(uid,comment['reply_id'])){
						return true;
					}
				}else{
					return true;
				}
			}
			return false;
		}

		var json_result = {};
		json_result['newsfeed_list'] = [];
		json_result['last_get_newsfeed_list'] = "1990-02-02 12:00:00";


		// 过滤评论和页码
		for(var i in newsfeed_list){

			var newsfeed = new friend_newsfeed(newsfeed_list[i]);
			for(var k in friend_list){
				if(friend_list[k]['id'] == newsfeed['uid']){
					newsfeed['name'] = friend_list[k]['name'];
					break;
				}
			}
			//console.log(util.inspect(newsfeed))

			if(inpage(i,page)){
				var comment_list = newsfeed_list[i]['comment'];

				for(var j in comment_list){
					var comment = comment_list[j];
					
					if(isVisibility(uid,comment)){
						comment['name'] = '';
						comment['reply_name'] = '';

						newsfeed['comment'].push(comment);
					}
				}
				json_result['newsfeed_list'].push(newsfeed)
			}
		}
		callback(player,json_result,'get_feed_list');

	});
}

exports.init_newsfeed = function(content){

	for(var i in content['newsfeed_list']){

		var newsfeed = new friend_newsfeed(content['newsfeed_list'][i]);
		//console.log(util.inspect(newsfeed));
		var uid = parseInt(newsfeed['uid']);
		if(g_newsfeed[uid] == undefined || g_newsfeed[uid] == null){
			g_newsfeed[uid] = {};
			g_newsfeed[uid]['newsfeed_list'] = [newsfeed,];
		}else{
			g_newsfeed[uid]['newsfeed_list'].push(newsfeed);
		}
		

		var comment_list = content['comment_list'];
		for(var i in comment_list){

			if( g_newsfeed[uid]['id'] == comment_list[i]['newsfeed_id']){
				g_newsfeed[uid].add_comment(comment_list[i])
			}
		}
		
	}



}