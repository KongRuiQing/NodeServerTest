
var db = require('../mysqlproxy');
var util = require('util');

exports.login = function(player,data)
{
	db.checkLogin(data['Account'],data['Password'],function(success,content){
		var ret = {};
		if(success){
			if(content['result']){
				g_playerlist.removePlayerByAccount(content['id']);
				player.SetUserLogin(content['user_info']);
				g_playerlist.addPlayer(player);
				
				ret['result'] = 0;
				ret['user_info'] = content['user_info'];

		}else{
			ret["result"] = 2;
		}
	}else{
		ret["result"] = 1;
	}
	player.emit("send",ret,"login");
});
	
}

exports.verifytelphone = function(player,data)
{
	var cb = function(success){
		var ret = {
			success : success,
			telphone:data['telphone']
		}
		if(success == 0)
		{
			player.setVerifyCode("1234");
			player.setTelphone(data['telphone']);
		}
		player.emit("send",ret,"verifytelphone");
	}
	db.VerifyTelphone(data['telphone'],cb);
}

exports.verifycode = function(player,data){

	var verify_code = data['verify_code'];
	var ret = {
		telphone:data['telphone'],
		verify_code:data['verify_code']
	};

	var b = player.checkVerifyCode(data['telphone'],data['verify_code'])

	if(b == true){
		ret.success = 0;
	}else
	{
		ret.success = 1000;
	}
	player.emit("send",ret,"verifycode");
	

}

exports.register = function(data,player){

	var cb = function(success,uid)
	{
		var ret = {
			telphone : data['telphone'],
			errcode : 1,
			uid:0
		};
		if(success)
		{
			ret.errcode = 0;
			ret.uid = uid;
		}else
		{
			ret.errcode = uid;
			ret.uid = 0;
		}
		console.log("注册成功后，这里要添加到缓存里 ");
		//g_playerlist.addPlayer(player);

		player.emit("send",ret,"register");
	}
	var su = player.checkVerifyCode(data['telphone'],data['verify_code']);
	if(su)
	{
		db.Register(data['telphone'],data['password'],cb);
	}else
	{
		player.emit("send",ret,"register");
	}
	
}