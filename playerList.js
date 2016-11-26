var db_proxy = require("./mysqlproxy");
var util = require('util');
var logger = require('./logger').logger();
var ShopProxy = require('./cache/shopCache');
var moment = require('moment');

g_playerlist = {
	'player_online_list':{},
	'playerCache':{},
	'account_uid':{},
	'reg_account' :{},
	'guid_to_uid' : {},
	'MaxUID' : 0,
};


g_playerlist.removePlayerByUID = function(uid)
{
	if(this.player_online_list[uid]){
		this.player_online_list[uid] = null;
	}
}

g_playerlist.getPlayerInfo = function(uid){
	if(this.playerCache[uid]){
		return this.playerCache[uid];
	}
	return null;
}

g_playerlist.InitFromDb = function(
	all_user_info,
	all_login_info,
	player_attention_shop_list,
	player_favorites_item){

	for(var i in all_login_info){
		var uid = parseInt(all_login_info[i]['Id']);
		this.playerCache[uid] = {
			"uid": uid,
			"account":all_login_info[i]['Account'],
			"password":all_login_info[i]['Password'],
			'state' : Number(all_login_info[i]['state'])
		};
		this['account_uid'][all_login_info[i]['Account']] = all_login_info[i]['Id'];
		
		this.MaxUID = Math.max(this.MaxUID,uid);
	}

	for(var i in all_user_info){
		var uid = all_user_info[i]['id'];

		if(this.playerCache[uid] != null){
			this.playerCache[uid]['head'] = all_user_info[i]['head'];
			this.playerCache[uid]['name'] = all_user_info[i]['name'];

			this.playerCache[uid]['birthday_timestamp'] = all_user_info[i]['birthday_timestamp'];
			this.playerCache[uid]['sign'] = all_user_info[i]['sign'] ;
			this.playerCache[uid]['address'] = all_user_info[i]['address'] ;
			this.playerCache[uid]['telephone'] = all_user_info[i]['telephone'];
			this.playerCache[uid]['email'] = all_user_info[i]['email'];
			this.playerCache[uid]['real_name'] = all_user_info[i]['real_name'];
			this.playerCache[uid]['attention_shop'] = [];
			this.playerCache[uid]['sex'] = all_user_info[i]['sex'];
			this.playerCache[uid]['shop_id'] = parseInt(all_user_info[i]['shop_id']);
			this.playerCache[uid]['favorites'] = [];
		}
	}
	logger.log("PLAYER_LIST",'Init Player Attention Shop Num : ' + player_attention_shop_list.length);
	for(var i in player_attention_shop_list){

		var uid = player_attention_shop_list[i]['uid'];
		var shop_id = player_attention_shop_list[i]['shop_id'];
		var attention_time = player_attention_shop_list[i]['attention_time'];

		if(this.playerCache[uid] != null){
			this.playerCache[uid]['attention_shop'].push({
				'shop_id' : shop_id,
				'attention_time' : attention_time
			});
		}
	}

	for(var i in player_favorites_item){
		var uid = player_favorites_item[i]['uid'];
		var item_id = player_favorites_item[i]['item_id'];
		var shop_id = player_favorites_item[i]['shop_id'];
		var add_time = player_favorites_item[i]['add_time'];
		logger.log("PLAYER_LIST",add_time);
		if(this.playerCache[uid] != null){
			this.playerCache[uid]['favorites'].push({
				'shop_id' : shop_id,
				'item_id' : item_id,
				'add_time' : add_time
			});
		}
	}
}

exports.CheckLogin = function(login_account,login_password){
	var uid = g_playerlist['account_uid'][login_account];
	logger.log("PLAYER_LIST",'CheckLogin:uid:' + uid);
	if(g_playerlist['playerCache'][uid] == null){
		console.log("false1");
		return 3;
	}
	var player_info = g_playerlist['playerCache'][uid];

	if(player_info['state'] == 1){

		return 2;
	}
	if(g_playerlist['playerCache'][uid]['password'] === login_password){
		//console.log("true");
		return 0;
	}

	return 1;
}

exports.IsLogin = function(login_account){
	var uid = g_playerlist['account_uid'][login_account];
	
	if(g_playerlist['player_online_list'][uid] != null){
		return true;
	}
	return false;
}

g_playerlist.KickPlayer = function(login_account){
	var uid = this.account_uid[login_account];
	this.removePlayerByUID(uid)
}

function getUTC() {  
	var d = new Date();  
	return Date.UTC(d.getFullYear()  
		, d.getMonth()  
		, d.getDate()  
		, d.getHours()  
		, d.getMinutes()  
		, d.getSeconds()  
		, d.getMilliseconds());  
} 

function generate(count) {
	var _sym = 'abcdefghijklmnopqrstuvwxyz1234567890';
	var str = '';

	for(var i = 0; i < count; i++) {
		str += _sym[parseInt(Math.random() * (_sym.length))];
	}
	str += getUTC();


	return str;
}

g_playerlist.Login = function(login_account){
	var uid = g_playerlist['account_uid'][login_account];
	var player_info = g_playerlist['playerCache'][uid];
	var guid = generate(10);
	g_playerlist['player_online_list'][uid] = guid;
	g_playerlist['guid_to_uid'][guid] = uid;
	var json_login = {};

	json_login['uid'] = uid;
	json_login['guid'] = guid;

	json_login['head'] = player_info['head'];
	json_login['nick_name'] = player_info['name'];
	json_login['sex'] = player_info['sex'];	
	json_login['birthday_timestamp'] = player_info['birthday_timestamp'];	
	json_login['sign'] = player_info['sign'];	
	json_login['address'] = player_info['address'];	
	json_login['telephone'] = player_info['telephone'];	
	json_login['email'] = player_info['email'];	
	json_login['real_name'] = player_info['real_name'];	
	json_login['shop_id'] = parseInt(player_info['shop_id']);
	json_login['shop_state'] = 0;
	if(player_info['shop_id'] > 0){
		shop_info = ShopProxy.FindShopInfo(player_info['shop_id']);
		if(shop_info && 'state' in shop_info && shop_info['state'] != 0){
			json_login['shop_state'] = shop_info['state'];
		}
	}
	
	return json_login;
}

exports.Login = function(login_account){

	var uid = g_playerlist['account_uid'][login_account];
	var player_info = g_playerlist['playerCache'][uid];
	var guid = generate(10);
	g_playerlist['player_online_list'][uid] = guid;
	g_playerlist['guid_to_uid'][guid] = uid;
	var json_login = {};

	json_login['uid'] = uid;
	json_login['guid'] = guid;

	json_login['head'] = player_info['head'];
	json_login['nick_name'] = player_info['name'];
	json_login['sex'] = player_info['sex'];
	if(player_info['birthday_timestamp']){
		json_login['birthday_timestamp'] = player_info['birthday_timestamp'];
	}	
		
	json_login['sign'] = player_info['sign'];	
	json_login['address'] = player_info['address'];	
	json_login['telephone'] = player_info['telephone'];	
	json_login['email'] = player_info['email'];	
	json_login['real_name'] = player_info['real_name'];	
	json_login['shop_id'] = player_info['shop_id'];
	return json_login;
}

g_playerlist.CheckRegTelephone = function(telephone){
	var uid = this.account_uid[telephone];
	if(uid == null){
		return true;
	}

	return false;
}

g_playerlist.RegisterStep = function(step,client_guid,telephone,code,password){
	
	if(step == 1){
		var uid = this.account_uid[telephone];
		if( uid == null ){
			var guid = generate(10);
			this.reg_account[guid] = {
				"guid" : guid,
				'telephone':telephone,
				'code' : '1234',
			};
			return {
				"guid" : guid,
				'telephone':telephone,
				'code' : '1234',
				'step':2,
			};

		}else{
			return {
				'error' : 2
			};
		}
	}else if(step == 2){
		var uid = this.account_uid[telephone];
		
		if(!uid && client_guid){
			var reg = this.reg_account[client_guid];
			if(!reg){
				return {
					'error' : 1
				}
			}else{
				if(reg['telephone'] == telephone && reg['code'] == code){
					return {
						"guid" : client_guid,
						'telephone':telephone,
						'code' : '1234',
						'step' : 3
					};
				}else
				{
					return {
						"error":3
					};
				}
			}
		}else {
			return {
				"error":2
			};
		}
		
	}else if(step == 3){
		var uid = this.account_uid[telephone];
		
		if(!uid && client_guid){
			//console.log("reg_account = " + util.inspect(this.reg_account));
			var reg = this.reg_account[client_guid];
			if(!reg){
				return {
					'error' : 1
				}
			}else{
				if(reg['telephone'] == telephone && reg['code'] == code){
					var uid = g_playerlist.Register(telephone,password);
					var loginInfo = g_playerlist.Login(telephone);
					loginInfo['step'] = 4;
					loginInfo['uid'] = uid;

					this.reg_account[client_guid] = null;

					return loginInfo;
				}else{
					return {
						"error":3
					};
				}
			}

		}else{
			return {
				"error":2
			};
		}
	}

	return 0;
}

function newPlayer(uid){
	return {
		'head' : "player/default.png",
		'sex' : 0,
		'shop_id' : 0,
		'name' : "用户" + uid,
		'attention_shop' : [],
		'favorites' : []
	};
}

g_playerlist.Register = function(telephone,password){
	var uid = this.account_uid[telephone];
	if(uid != null){
		return false;
	}
	uid = g_playerlist.MaxUID + 1;
	g_playerlist.MaxUID = g_playerlist.MaxUID + 1;

	this.account_uid[telephone] = uid;

	this.player_online_list[uid] = {};

	this.playerCache[uid] = newPlayer(uid);
	
	this.account_uid[telephone] = uid;

	this.reg_account[telephone] = null;

	db_proxy.AddNewPlayer(uid,telephone,password,function(success){
		if(success){
			console.log("Register success")
		}
	});
	return uid;
}

exports.getMyFavoritesItems = function(guid,page){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid != null){
		var player_info = g_playerlist['playerCache'][uid];
		if(player_info != null){
			return player_info['favorites'].slice((page - 1) * 15,page * 15 - 1);
		}
	}
	logger.warn("PLAYER_LIST","[getMyFavoritesItems] can't find uid or player info");
	return [];
}

exports.getMyAttention = function(guid){

	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid == null){
		logger.warn("PLAYER_LIST","getMyAttention:uid = 1,guid:" + guid);
		logger.log("PLAYER_LIST","All guid is:");
		logger.log("PLAYER_LIST","All guid is:" + util.inspect(g_playerlist['guid_to_uid']));
		uid = 1;
	}
	var player = g_playerlist['playerCache'][uid];
	if(player != null){
		//logger.log("PLAYER_LIST","[get][attention]: attention_shop list:" + util.inspect(player['attention_shop']));
		return player['attention_shop'];
	}
	return [];
}


exports.changeSex = function(guid,sex){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid == null){
		logger.warn("PLAYER_LIST","changeSex:uid = null,guid:" + guid);
		logger.log("PLAYER_LIST","All guid is:");
		logger.log("PLAYER_LIST","All guid is:" + util.inspect(g_playerlist['guid_to_uid']));
		return {
			'error' : 1
		};
	}
	var player_info = g_playerlist['playerCache'][uid];
	if(sex != player_info['sex']){
		player_info['sex'] = sex;
		db_proxy.ChangeSex(uid,sex);
	}
	return {
		'error' : 0
	};
}

exports.changeNickName = function(guid,nick_name){

	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid == null){
		logger.warn("PLAYER_LIST","changeSex:uid = null,guid:" + guid);
		logger.log("PLAYER_LIST","All guid is:");
		logger.log("PLAYER_LIST","All guid is:" + util.inspect(g_playerlist['guid_to_uid']));
		return {
			'error' : 1
		};
	}
	var player_info = g_playerlist['playerCache'][uid];
	if(nick_name != player_info['nick_name']){
		player_info['nick_name'] = nick_name;
		db_proxy.ChangeNickName(uid,nick_name);
	}

	return {
		'error' : 0,
		'nick_name' : nick_name
	};
}

exports.changeBirthday = function(guid,birthday_timestamp){

	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid == null){
		logger.warn("PLAYER_LIST","changeSex:uid = null,guid:" + guid);
		logger.log("PLAYER_LIST","All guid is:");
		logger.log("PLAYER_LIST","All guid is:" + util.inspect(g_playerlist['guid_to_uid']));
		return {
			'error' : 1
		};
	}
	var player_info = g_playerlist['playerCache'][uid];
	if(birthday_timestamp != player_info['birthday_timestamp']){
		player_info['birthday_timestamp'] = birthday_timestamp;
		db_proxy.ChangeBirthday(uid,birthday_timestamp);
	}

	return {
		'error' : 0,
		'birthday':birthday_timestamp
	};
}

exports.changeSign = function(guid,sign){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid == null){
		logger.warn("PLAYER_LIST","changeSex:uid = null,guid:" + guid);
		logger.log("PLAYER_LIST","All guid is:");
		logger.log("PLAYER_LIST","All guid is:" + util.inspect(g_playerlist['guid_to_uid']));
		return {
			'error' : 1
		};
	}
	var player_info = g_playerlist['playerCache'][uid];
	if(sign != player_info['sign']){
		player_info['sign'] = sign;
		db_proxy.ChangeSign(uid,sign);
	}
	return {
		'error' : 0,
		'sign':sign
	};
}

exports.CheckSeller = function(guid){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid == null){
		logger.warn("PLAYER_LIST","CheckSeller:uid = null,guid:" + guid);
		logger.log("PLAYER_LIST","All guid is:");
		logger.log("PLAYER_LIST","All guid is:" + util.inspect(g_playerlist['guid_to_uid']));
		return {
			'error' : 1
		};
	}
	logger.log("PLAYER_LIST","uid = " + uid);
	var player_info = g_playerlist['playerCache'][uid];
	if(player_info != null && player_info['shop_id'] == 0){
		return uid;
	}
	logger.log("PLAYER_LIST",util.inspect(g_playerlist['playerCache']));

	return 0;
}

exports.SetUserShopId = function(guid,shop_id){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid == null){
		logger.warn("PLAYER_LIST","CheckSeller:uid = null,guid:" + guid);
		logger.log("PLAYER_LIST","All guid is:");
		logger.log("PLAYER_LIST","All guid is:" + util.inspect(g_playerlist['guid_to_uid']));
		return {
			'error' : 1
		};
		return;
	}
	var player_info = g_playerlist['playerCache'][uid];

	player_info['shop_id'] = shop_id;
}

exports.changeShopState = function(guid){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid == null){
		logger.error("PLAYER_LIST","[changeShopState]No guid find in guid:" + guid);
		return;
	}

	var player_info = g_playerlist['playerCache'][uid];
	if(player_info == null){
		logger.error("PLAYER_LIST","[changeShopState] No player info find uid:" + uid);
		return;
	}

	return player_info['shop_id'];
}

exports.attentionShop = function(guid,shop_id){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid == null || uid == 0){
		logger.error("PLAYER_LIST","[attentionShop]No guid find in guid:" + guid);
		return 0;
	}
	var player_info = g_playerlist['playerCache'][uid];
	if(player_info == null){
		logger.error("PLAYER_LIST","[attentionShop]No player info find uid:" + uid);
		return 0;
	}
	
	if(!(shop_id in player_info['attention_shop'])){
		player_info['attention_shop'].push({
			'shop_id' : shop_id,
			'attention_time' : Date.now()
		});
		return uid;
	}else{
		return -1;
	}
	return 0;
}

exports.getUid = function(guid){
	return g_playerlist['guid_to_uid'][guid];
}


exports.addToFavorites = function(guid,shop_id,item_id){
	var uid = g_playerlist['guid_to_uid'][guid];

	if(uid != null && uid > 0){
		var player_info = g_playerlist['playerCache'][uid];

		if(player_info != null){
			for(var i in player_info['favorites']){
				if(item_id == player_info['favorites'][i]['item_id']){
					return 0;
				}
			}
			
			player_info['favorites'].push({
				'shop_id' : shop_id,
				'item_id' : item_id,
				'add_time' : moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
			});
			//logger.log("PLAYER_LIST",moment(now).format('YYYY-MM-DD HH:mm:ss'));
		}
		
		return uid;
	}
	return 0;
}

exports.changeUserInfo = function(uid,user_info_list){
	if(uid in g_playerlist['playerCache']){
		var player_info = g_playerlist['playerCache'][uid];
		player_info['nick_name'] = user_info_list[0];
		player_info['sex'] = user_info_list[1];
		player_info['birthday_timestamp'] = user_info_list[2];
		player_info['sign'] = user_info_list[3];
		player_info['address'] = user_info_list[4];
		player_info['email'] = user_info_list[5];
		player_info['real_name'] = user_info_list[6];
		player_info['telephone'] = user_info_list[7];
		player_info['verify_code'] = user_info_list[8];
	}
	
}

exports.getShopId = function(guid){
	if(guid in g_playerlist['guid_to_uid']){
		var uid = g_playerlist['guid_to_uid'][guid];
		if(uid in g_playerlist['playerCache']){
			return g_playerlist['playerCache'][uid]['shop_id'];
		}
	}

	return 0;
}

exports.removeFavoritesItem = function(guid,favorites_id){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid > 0){
		var player_info = g_playerlist['playerCache'][uid];
		var my_favorites_items = player_info['favorites'];
		for(var key in my_favorites_items){
			if(my_favorites_items[key]['item_id'] == favorites_id){

				my_favorites_items[key] = null;
				my_favorites_items.splice(key,1);

				return {
					'item_id' : favorites_id,
					'uid' : uid
				};
			}
		}
	}

	return null;
}

exports.checkMyActivity = function(guid){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid > 0){
		var player_info = g_playerlist['playerCache'][uid];
		if(player_info != null){
			var shop_id = player_info['shop_id'];
			if(shop_id > 0){
				return {
					"uid" : uid,
					"shop_id" : shop_id
				};
			}
		}
	}

	return null;
}

exports.checkRenewalActivity = function(guid){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid > 0){
		var player_info = g_playerlist['playerCache'][uid];
		if(player_info != null){
			var shop_id = player_info['shop_id'];
			if(shop_id > 0){
				return {
					'error' : 0,
					'shop_id' : shop_id,
					'uid' : uid
				};
			}
		}
	}

	return {
		'error' : 1
	};
	
}