var mysql = require('mysql');
var connection = mysql.createConnection({
	host     : '115.159.67.251',
	user     : 'eplus-find',
	password : 'eplus-find',
	port:'3306',
	database : 'find'
});


connection.connect(function(err){
	if(err)
	{
		console.log('[sql] - :' + err);
		return;
	}
	console.log('[sql connect]')
});


exports.query = function(sql)
{
	connection.query(sql,function(err,row,fields){
		if(err)
		{
			console.log('[sql] - :' + err);
			return;
		}
		
	});
}

exports.checkLogin = function(account,password,callback){

	var sql = 'select * from userlogin where Account = "' + account + '" and Password = "' + password +'"';
	
	connection.query(sql,function(err,row,fields){
		
		if(err)
		{
			console.log("db Error : " + err);
			callback(false);
			return;
		}

		var json_result = {};

		if(row.length == 1)
		{
			json_result['id'] = row[0].Id;
			callback(true,json_result);
		}
		else
		{
			callback(false)
		}
	});
}

exports.VerifyTelphone = function(telphone,cb)
{
	var sql  = 'select * from userlogin where Account = "' + telphone + '"';
	connection.query(sql,function(err,row,fields){
		if(err)
		{
			console.log("[db] query error with sql " + sql);
			cb(1000);
			return;
		}
		if(row.length > 0)
		{
			cb(1001)
			return;
		}
		else
		{
			cb(0);
			return;
		}
	}) ;
}

exports.Register = function(telphone,password,cb)
{
	connection.query('CALL register('+telphone+ ','+password + ',@a,@b' +')', function(err, result) {  
		if (err){
			console.log(err);
			cb(false,0);
			return;
		}
		var db_ret = result[0][0];
		if(db_ret.result == 1)
		{
			cb(true,result[0].finduid);
		}
		else
		{
			db(false,db_ret.result);
		}
		
		//console.log(result[0]);
	}); 
}

exports.GetShopList = function(pageIndex,pageSize,longitude,latitude,cb)
{
	connection.query("CALL p_get_shop_list(?,?,?,?,?,?)",[pageIndex,pageSize,"*","shop",longitude,latitude],function(err,result){
		if(err){
			console.log(err);
			cb(false,null);
			return;
		}
		
		var db_ret = result[0];
		var ret = [];
		for(var i in db_ret){
			var row = db_ret[i];
			row.longitude = 0;
			row.latitude = 0;
			ret.push(row);
		}
		cb(true,ret);
	});
}

exports.close = function()
{
	connection.end();
}


exports.getAreaMenu = function(area_code,callback){
	
	connection.query("CALL p_get_area_menu(?)",[area_code],function(err,result){
		if(err){
			console.log(err);
			callback(false,null);
			return;
		}else
		{
			var db_ret = result[0];
			var json_result = [];

			for(var i in db_ret){
				var row = db_ret[i];
				json_result.push(row);
			}
			callback(true,json_result);
		}
	});
}

exports.getShopAfterFilter = function(city_no,area_code,category_code,sort_code,page,callback){
	connection.query("CALL p_get_shop_with_filter(?,?,?,?,?,10)",[city_no,area_code,category_code,sort_code,parseInt(page)],function(err,result){
		if(err){
			console.log(err);
			callback(false,null);
		}else{
			var db_ret = result[0];
			var json_result = [];
			for(var i in db_ret){
				var row = db_ret[i];
				json_result.push(row);
			}
			callback(true,json_result);
		}
	});
}

exports.getShopDetail = function(shop_id,callback){
	shop_id = shop_id || "";
	connection.query("call p_get_shop_detail(?)",[shop_id],function(err,result){
		if(err){
			console.log(err);
			callback(false,null);
		}else{
			var shopCount = result[0][0];
			
			if(parseInt(shopCount.shop_num) != 1){
				console.log("ERROR:");
				for(var i in shopCount){
					console.log(i + ":" + shopCount[i]);
				}
				callback(false,null);
				return;
			}
			var ad_image = result[0][1];

			var json_result = {};
			json_result["ad"] = [];

			for(var i in ad_image){
				var row = ad_image[i];
				json_result["ad"].push(row.image_path);
			}
			json_result['ad'].push("album.png");
			json_result['ad'].push("as_other_bt_bg.png");
			
			var shop_detail = result[0][2];
			var shop_info = result[0][3];
			var shop_attention = result[0][4];
			var shop_banner = result[0][5];
			console.log(typeof shop_detail);
			if(typeof shop_detail === 'undefined')
			{
				json_result['nature'] = 'nature';
			}
			else{
				if(shop_detail.hasOwnProperty("nature"))
				{
					json_result['nature'] = shop_detail.nature;
				}else
				{
					json_result['nature'] = 'nature';
				}
			}
			
			
			if(typeof shop_info === 'undefined')
			{
				json_result['name'] = 'name';
			}else
			{
				json_result['name'] = shop_info.name;
			}
			//json_result['attention'] = shop_attention.num;
			if(typeof shop_banner === 'undefined')
			{
				json_result['banner'] = ['banner_1.png','banner_1.png'];
			}
			else
			{
				json_result['banner'] = [];
				for(var i in shop_banner){
					json_result['banner'].push('banner_1.png');
				}
			}

			callback(true,json_result);
		}
	});
}

exports.db_find_friend = function(findName,userid,callback){

	connection.query("CALL p_find_player(?,?)",[findName,userid],function(err,result){
		if(err){
			console.log(err);
			callback(false,null);
		}else{
			if(!result.length || result.length != 3){
				if(!!result.length){
					console.log("[Error] mysqlproxy.db_find_friend:" + result.length);
				}
				callback(false,null);
			}
			var db_ret = result[0];
			var json_result = {};
			var user_info = db_ret[0];
			
			if(user_info != undefined){

				var user_id = parseInt(user_info.id);
				if(user_id > 0){
					json_result['id'] = user_id;
					json_result['head'] = user_info.head;
					json_result['name'] = user_info.name;
					json_result['signature'] = user_info.signature;
				}
			}else{
				json_result['id'] = "";
			}
			var db_relation = db_ret[1];
			if(db_relation != undefined){
				json_result['is_friend'] = false;
			}else{
				json_result['is_friend'] = false;
			}
			
			callback(true,json_result);
		}
	});
}

exports.db_be_friend = function(fid,uid,callback){

	connection.query("CALL p_be_friend(?,?)",[uid,fid],function(err,result){
		if(err){
			console.log(err);
			callback(false,{"error":-1});
		}else{
			if(!result.length || result.length != 3){
				callback(false,{"error":-2});
				return;
			}

			var db_ret = result[0];

			var success = db_ret[0].success;
			callback(true,{'success':success});

		}
	});
};

exports.query_be_friend_list = function(uid,callback){

	connection.query("CALL p_get_be_friend_list(?)",[uid],function(err,result){
		if(err){
			console.log("err");
			callback(false,null);
		}else{
			var db_ret = result[0];

			var json_result = [];
			for(var row in db_ret[0]){
				json_result.push(row);
			}
			callback(true,json_result);
		}
	});
};