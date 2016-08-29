
g_playerlist = {
	'playerlist':{},
	'playerCache':{},
	'account_uid':{}
};

g_playerlist.removePlayerByUID = function(uid)
{
	if(this.playerlist[uid]){
		this.playerlist[uid] = null;
	}
}

g_playerlist.InitFromDb = function(all_user_info,all_login_info){

	for(var i in all_login_info){
		var uid =all_login_info[i]['Id'];
		this.playerCache[uid] = {
			"uid":all_login_info[i]['Id'],
			"account":all_login_info[i]['Account'],
			"password":all_login_info[i]['Password'],
		};
		this['account_uid'][all_login_info[i]['Account']] = all_login_info[i]['Id'];
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