var db_proxy = require("./mysqlproxy");
var util = require('util');

g_playerlist = {
	'playerlist':{},
	'playerCache':{},
	'account_uid':{},
	'reg_account' :{},
	'MaxUID' : 0
};



g_playerlist.removePlayerByUID = function(uid)
{
	if(this.playerlist[uid]){
		this.playerlist[uid] = null;
	}
}

g_playerlist.InitFromDb = function(all_user_info,all_login_info){

	for(var i in all_login_info){
		var uid = parseInt(all_login_info[i]['Id']);
		this.playerCache[uid] = {
			"uid": uid,
			"account":all_login_info[i]['Account'],
			"password":all_login_info[i]['Password'],
		};
		this['account_uid'][all_login_info[i]['Account']] = all_login_info[i]['Id'];
		
		this.MaxUID = Math.max(this.MaxUID,uid);
	}
	

	for(var i in all_user_info){
		var uid = all_user_info[i]['id'];
		if(this.playerCache[uid] != null){
			this.playerCache[uid]['head'] = all_user_info[i]['head'];
			this.playerCache[uid]['name'] = all_user_info[i]['name'];
		}
	}
}

g_playerlist.CheckLogin = function(login_account,login_password){
	var uid = this['account_uid'][login_account];
	console.log(uid);
	if(this.playerCache[uid] == null){
		console.log("false1");
		return false;
	}
	if(this.playerCache[uid]['password'] === login_password){
		console.log("true");
		return true;
	}

	return false;
}

g_playerlist.IsLogin = function(login_account){
	var uid = this.account_uid[login_account];
	
	if(this.playerlist[uid] != null){
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

	var uid = this.account_uid[login_account];
	var player_cache = this.playerCache[uid];
	var guid = generate(10);
	this.playerlist[uid] = guid;
	var json_login = {};
	json_login['uid'] = uid;
	json_login['guid'] = guid;
	json_login['head'] = player_cache['head'];
	json_login['name'] = player_cache['name'];

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
		if( !uid){
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
			console.log("reg_account = " + util.inspect(this.reg_account));
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

g_playerlist.Register = function(telephone,password){
	var uid = this.account_uid[telephone];
	if(uid != null){
		return false;
	}
	uid = g_playerlist.MaxUID + 1;
	g_playerlist.MaxUID = g_playerlist.MaxUID + 1;

	this.account_uid[telephone] = uid;

	this.playerlist[uid] = {};

	this.playerCache[uid] = {};
	this.playerCache[uid]['head'] = "player/default.png"
	this.playerCache[uid]['name'] = "用户" + uid;

	this.account_uid[telephone] = uid;

	this.reg_account[telephone] = null;

	db_proxy.AddNewPlayer(uid,telephone,password,function(success){
		if(success){
			console.log("Register success")
		}
	});
	return uid;
}
