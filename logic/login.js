
var db = require('../mysqlproxy');
var util = require('util');
exports.login = function(data,target,callback)
{
	db.checkLogin(data['Account'],data['Password'],function(success,content){
		var ret = {};
		if(success){
			if(content['result']){
				var findPlayer = g_playerlist.findPlayerByAccount(data['Account']);

				if(findPlayer != null)
				{
					g_playerlist.removePlayerByAccount(data['Account']);
				}
				//console.log(util.inspect(content));

				g_playerlist.setLogin(target,data['Account']);

				target.SetUserLogin(content['user_info']);

				ret['result'] = 0;
				ret['user_info'] = content['user_info'];

		}else{
			ret["result"] = 2;

		}
	}else{
		ret["result"] = 1;

	}

	callback(target,ret,'Login');
});
	
}

exports.verifytelphone = function(data,target,callback)
{

	var cb = function(success){
		var ret = {
			success : success,
			telphone:data['telphone']
		}
		if(success == 0)
		{
			target.setVerifyCode("1234");
			target.setTelphone(data['telphone']);
		}
		callback(target,ret,"verifytelphone");
	}
	db.VerifyTelphone(data['telphone'],cb);
}

exports.verifycode = function(data,target,callback){

	var verify_code = data['verify_code'];
	var ret = {
		telphone:data['telphone'],
		verify_code:data['verify_code']
	};

	var b = target.checkVerifyCode(data['telphone'],data['verify_code'])

	if(b == true){
		ret.success = 0;
	}else
	{
		ret.success = 1000;
	}
	callback(target,ret,"verifycode");

}

exports.register = function(data,target,callback){

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

		callback(target,ret,"register");
	}
	var su = target.checkVerifyCode(data['telphone'],data['verify_code']);
	if(su)
	{
		db.Register(data['telphone'],data['password'],cb);
	}else
	{
		cb(2);
	}
	
}