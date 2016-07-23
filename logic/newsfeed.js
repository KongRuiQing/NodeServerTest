var db = require('../mysqlproxy');
var friend = require('./friend');
var util = require('util');
var userinfo = require("../userinfo");
// newsfeed_id newsfeed
g_feed = {};
g_feed_comment = {};


function newsfeed_comment(json_value){
	this.id = json_value['id'];
	this.uid = json_value['uid'];
	var user = userinfo.find_userinfo(this.uid);

	this.name = user['name'];

	this.reply_id = json_value['reply_id'];
	var reply_to = userinfo.find_userinfo(this.reply_id);
	this.reply_name = reply_to['name'];
	this.feed_id = json_value['newsfeed_id'];
	this.comment = json_value['text'];
	this.sendTime = json_value['public_time'];
}

newsfeed_comment.prototype.toJsonValue = function(){
	var json_value = {};
	json_value['id'] = this.id;
	json_value['uid'] = this.uid;
	json_value['name'] = this.name;
	json_value['reply_id'] = this.reply_id;
	json_value['reply_name'] = this.reply_name;
	json_value['feed_id'] = this.feed_id;
	json_value['comment'] = this.comment;
	json_value['sendTime'] = this.sendTime;
	return json_value;
}


function friend_newsfeed(json_value){
	
	this.id = parseInt(json_value['id']);
	this.uid = parseInt(json_value['uid']);
	this.content = json_value['content'] || "";

	this.images = [json_value['image1'],json_value['image2'],json_value['image3'],json_value['image4'],json_value['image5'],json_value['image6']];

	this.sendTime = json_value['public_time'];
	this.like = [];
	this.comments = [];
}

friend_newsfeed.prototype.add_comment = function(json_value){
	this.comments.push(new newsfeed_comment(json_value))
}
friend_newsfeed.prototype.toJsonValue = function(){
	var json_value = {};
	json_value['id'] = this.id;
	json_value['uid'] = this.uid;
	json_value['content'] = this.content;
	json_value['images'] = [];
	for(var image_index in this.images){
		if(this.images[image_index] != null){
			json_value['images'].push(this.images[image_index]);
		}else{

		}
	}
	json_value['sendTime'] = this.sendTime;
	json_value['like'] = [];
	json_value['comments'] = [];
	for(var i in this.comment){
		var json_comment = this.comment[i].toJsonValue();
		json_value['comments'].push(json_comment)
	}
	return json_value;
}

exports.add_newsfeed = function(json_value){
	
	var uid = json_value['uid'];
	
	if(g_feed[uid] == null || g_feed[uid] == undefined){
		
		g_feed[uid] = {};
		g_feed[uid]['newsfeed_list'] = [new friend_newsfeed(json_value)];
	}else{
		
		g_feed[uid]['newsfeed_list'].push(new friend_newsfeed(json_value));
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
			if(id != undefined && g_feed[id] != undefined){
				newsfeed_list = newsfeed_list.concat(g_feed[id]['newsfeed_list']);
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
		var uid = parseInt(newsfeed['uid']);
		if(g_feed[uid] == undefined || g_feed[uid] == null){
			g_feed[uid] = {};
			g_feed[uid]['newsfeed_list'] = [newsfeed];
		}else{
			g_feed[uid]['newsfeed_list'].push(newsfeed);
		}
		

		var comment_list = content['comment_list'];
		for(var i in comment_list){
			if( g_feed[uid]['id'] == comment_list[i]['newsfeed_id']){
				g_feed[uid].add_comment(comment_list[i])
			}
		}
		
	}
}

exports.find_myfeed = function(uid){

	return g_feed[uid]['newsfeed_list'];
}