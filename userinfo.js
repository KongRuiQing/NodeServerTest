var logger = require('./logger').logger();

g_all_userinfo = {};

exports.init_from_db = function(db_result){

	for(var i in db_result){
		var userinfo = db_result[i];
		var json_value = {};
		json_value['id'] = userinfo['id'];
		json_value['name'] = userinfo['name'];
		
		g_all_userinfo[userinfo['id']] = json_value;
	}
}

exports.find_userinfo = function(uid){
	return g_all_userinfo[uid];
}
