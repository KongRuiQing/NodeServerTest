var mysql = require('mysql');
var util = require('util');
var newsfeed = require('./logic/newsfeed');
var friend = require('./logic/friend');
var logger = require('./logger').logger();

var connection = mysql.createConnection({
	host     : '115.159.67.251',
	user     : 'eplus-find',
	password : 'eplus-find',
	port:'3306',
	database : 'find',
	dateStrings: true
});



connection.connect(function(err){
	if(err)
	{
		logger.error(err);
		return;
	}


	initNewsfeedFromDB(newsfeed.init_newsfeed);
	initFriendRelation(friend.init_friend_relation);
	logger.log("START","sql connection success");
});


function initNewsfeedFromDB(callback){
	connection.query("CALL p_get_all_newsfeed",function(err,result){
		if(err){
			logger.error(err);
			return;
		}
		//console.log(util.inspect(result));
		var json_result = {};
		json_result['newsfeed_list'] = [];
		json_result['comment_list'] = [];

		for(var i in result[0]){
			json_result['newsfeed_list'].push(result[0][i]);
		}
		
		for(var i in result[1]){
			json_result['comment_list'].push(result[1][i]);
		}
		callback(json_result);
	});
	
}

function initFriendRelation(callback){
	callback("1");
}

exports.checkLogin = function(account,password,callback){

	connection.query("CALL p_get_user_login(?,?)",[account,password],function(err,db_result){
		if(err){
			logger.error(err);
			callback(false,null);
		}else{

			if(!util.isArray(db_result)){
				callback(true,{'result':false});
				return;
			}
			if(db_result.length < 2){
				console.log("err");
				callback(true,{'result':false});
				return;
			}
			var db_set = db_result[0];
			var user_id = parseInt(db_set[0].id);

			
			
			if(user_id > 0){
				var user_info = {};
				user_info['id'] = user_id;
				user_info['head'] = db_result[1][0]['head'];
				user_info['name'] = db_result[1][0]['name'];
				user_info['signature'] = db_result[1][0]['signature'];
				
				user_info['request_be_friend_count'] = parseInt(db_result[2][0].count);
				if(db_result[3].length > 0){
					user_info['last_request_be_friend_datetime'] = db_result[3][0].send_time;
				}
				
				callback(true,{'result':true,'user_info':user_info});
			}else{
				callback(true,{'result':false});
			}
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
			console.log(shopCount);
			if(parseInt(shopCount['shop_num']) != 1){
				console.log("ERROR:");
				for(var i in shopCount){
					console.log(i + ":" + shopCount[i]);
				}
				callback(false,null);
				return;
			}

			var ad_image = result[1];

			var json_result = {};
			json_result["show_image"] = [];
			
			for(var i in ad_image){
				var row = ad_image[i];
				var json_value = {};
				json_value['image_url'] = row['item_image'];
				json_value['item_name'] = row['item_name'];
				json_value['item_price'] = row['item_price'];
				json_result["show_image"].push(json_value);
			}

			var shop_detail = result[2][0];
			json_result['shop_name'] = shop_detail['name'];
			json_result['shop_id'] = shop_detail['Id'];	
			json_result['telphone'] = shop_detail['telphone'];

			var json_shop_info = {};

			json_shop_info['info'] = shop_detail['info'];
			json_shop_info['title'] = shop_detail['title'];
			json_shop_info['beg'] = shop_detail['beg'];
			json_shop_info['end'] = shop_detail['end'];
			json_shop_info['address'] = shop_detail['address'];
			json_shop_info['distribution'] = shop_detail['distribution']; // 传送地址
			json_shop_info['email'] = shop_detail['email'];
			json_result['info'] = json_shop_info;

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

exports.query_be_friend_list = function(uid,last_time,callback){

	connection.query("CALL p_get_be_friend_list(?,?)",[uid,last_time],function(err,result){
		if(err){
			console.log("[DB] [query_be_friend_list]:" + err);
			callback(false,null);
		}else{
			var db_ret = result[0];

			var json_result = [];
			for(var row in db_ret){
				json_result.push(db_ret[row]);
			}
			callback(true,json_result);
		}
	});
};

exports.add_newsfeed = function(uid,content,images,callback){
	
	var params = [uid,content].concat(images);
	console.log(params);
	connection.query("CALL p_add_newsfeed(?,?,?,?,?,?,?,?,?,?)",params,function(err,result){
		if(err){
			console.log(err);
			callback(false);
		}else{
			var json_result = {};
			json_result = result[0];
			callback(true,json_result);
		}
	});
};

exports.agree_be_friend = function(uid,fid,callback){
	connection.query("CALL p_agree_be_friend(?,?)",[uid, fid],function(err,result){
		if(err){
			console.log(err);
			callback(false,null);
		}else{
			//console.log(util.inspect(result));
			var db_set = result[0];
			var id = parseInt(db_set[0]["id"]);
			var friend_info = {};
			if(result.length >= 3){
				db_set = result[1];
				friend_info['id'] = db_set[0]["id"];
				friend_info['name'] = db_set[0]["name"];
				friend_info['signature'] = db_set[0]["signature"];
				friend_info['head'] = db_set[0]["head"];
			}
			
			if(id > 0){
				callback(true,{"result":true,"info":friend_info});
			}else{
				callback(true,{"result":false});
			}
		}
	});
};

exports.query_friend_list = function(uid,callback){
	connection.query("CALL p_get_friend_list(?)",[uid],function(err,result){
		if(err){
			console.log(err);
			callback(false,null);
		}else{
			//console.log(util.inspect(result));
			var db_result = {};
			db_result['friend_list'] = [];
			var db_set = result[0];
			var compare_time = null;
			if (db_set.length > 0 && db_set[0] != undefined){
				compare_time = Date.parse(new Date(db_set[0]));
			}
			
			var friend_list = result[1];
			var compare = function(friend){
				if(compare_time == null){
					return true;
				}
				if(friend['update_time'] == null){
					return true;
				}
				if(friend['make_time'] == null){
					return true;
				}
				var time1 = Date.parse(new Date(friend['update_time']));
				if(time1 > compare_time){
					return true;
				}
				var time2 = Date.parse(new Date(friend['make_time']));
				if(time2 > compare_time){
					return true;
				}
				return false;
			}
			for(var friend in friend_list){
				var json_friend = {};
				json_friend['id'] = friend_list[friend]['uid'];
				json_friend['name'] = friend_list[friend]['name'];
				json_friend['head'] = friend_list[friend]['head'];
				json_friend['signature'] = friend_list[friend]['signature'];
				json_friend['relation'] = friend_list[friend]['relation'];
				if(compare(friend)){
					db_result['friend_list'].push(json_friend);
				}
				
			}
			callback(true,db_result);
		}
	});
};

exports.fetch_all_newsfeed = function(callback){
	console.log("1111");
	var json_result = {
		'newsfeed_list':[]
	};
	return json_result;
}

exports.fetch_all_friend = function(uid,callback){

	connection.query("CALL p_get_friend_list(?)",[uid],function(err,result){
		if(err){
			console.log(err);
			callback(false,null);
		}else{
			//console.log(util.inspect(result));
			var db_result = {};
			db_result['friend_list'] = [];
			var db_set = result[0];
			var compare_time = null;
			if (db_set.length > 0 && db_set[0] != undefined){
				compare_time = Date.parse(new Date(db_set[0]));
			}
			
			var friend_list = result[1];
			
			for(var friend in friend_list){
				var json_friend = {};
				json_friend['id'] = parseInt(friend_list[friend]['uid']);
				json_friend['name'] = friend_list[friend]['name'];
				//json_friend['update_time'] = "0";
				db_result['friend_list'].push(json_friend);
				
			}
			callback(true,db_result);
		}
	});
}

exports.getAdImage = function(callback){
	connection.query("CALL p_get_ad_images",function(err,result){
		if(err){
			logger.error(err);
			callback(false,null);
		}else{
			var db_set = result[0];
			var json_result = [];
			for(var i in db_set){
				json_result.push(db_set[i]['image']);
			}
			callback(true,json_result);
		}
	});
}

exports.getAllShopSpread = function(page,query,callback){
	

	connection.query("CALL p_get_all_shop_spread(?,?,?,?,?,?)",[page,10,query['area_code'],query['zone_code'],query['cate_code'],query['sort_code']],function(err,result){
		if(err){
			logger.error(err);
			callback(false,null);
		}else{
			var db_set = result[0];
			var json_result = [];
			for(var i in db_set){
				json_result.push(db_set[i]);
				json_result.push(db_set[i]);
				json_result.push(db_set[i]);
			}
			callback(true,json_result);
		}
	});
}