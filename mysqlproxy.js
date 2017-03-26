'use strict';

var mysql = require('mysql');
var util = require('util');
var newsfeed = require('./logic/newsfeed');
var friend = require('./logic/friend');
var logger = require('./logger').logger();
var ShopCache = require("./cache/shopCache");
var DbCache = require("./cache/DbCache");
var PlayerProxy = require("./playerList");
var db_config = {
	host     : '139.224.227.82',
	user     : 'eplus-find',
	password : 'eplus-find',
	port:'3306',
	database : 'find',
	dateStrings: true
};

var connection = mysql.createConnection(db_config);

function handleMySqlError(err){
	if(err){
		if(err.code === 'PROTOCOL_CONNECTION_LOST'){
			reconnect_mysql();
		}
	}
}

function handleInitMysql(err){
	if(err){
		logger.error(err);
		return;
	}
	initUserInfoFromDB();
	//initNewsfeedFromDB(newsfeed.init_newsfeed);
	initFriendRelation(friend.init_friend_relation);
	initDbCache();
	initShopCache();

	logger.log("MYSQL_PROXY","sql init connection success");
}

function connect_mysql(){
	connection = mysql.createConnection(db_config);
	connection.connect(handleInitMysql);
	connection.on('error',handleMySqlError);
}

function reconnect_mysql(){
	connection = mysql.createConnection(db_config);
	connection.connect(function(err){
		if(err){
			logger.error("INFO",err);
		}else{
			logger.log("INFO","re connect success");
		}
	});
	connection.on('error',handleMySqlError);
}


//
connect_mysql();
//

function initUserInfoFromDB(callback){
	
	connection.query("CALL p_get_all_userinfo",function(err,result){
		
		var all_user_info = result[0];
		var all_login_info = result[1];
		var all_claim_info = result[4];
		logger.log("INFO",all_claim_info);
		PlayerProxy.InitFromDb(all_user_info,all_login_info,result[2],result[3],all_claim_info);
		logger.log("INFO","init userinfo from db");
	});
}


function initNewsfeedFromDB(callback){
	logger.log("MYSQL","init feed from DB");
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

function initDbCache(){
	connection.query("CALL p_get_config_from_db",function(error,result){
		if(error){
			logger.error(error);
		}
		DbCache.getInstance().InitFromDb(result);
		logger.log("MYSQL","init all config from DB");
	});
}

function initShopCache() {
	connection.query("CALL p_get_all_shop",function(error,result){
		if(error){
			logger.error(error);
		}
		ShopCache.InitFromDb(result[0],result[1],result[2],result[3],result[4],result[5],result[6],result[7],result[8]);
		logger.log("MYSQL","init all shop from DB");
	});
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

	connection.query("CALL p_get_shop_with_filter(?,?,?,?,?,10)",
		[city_no,area_code,category_code,sort_code,parseInt(page)],
		function(err,result){
			if(err){
				console.log(err);
				callback(false,null);
			}else{
				var db_ret = result[0];
				var json_result = {};
				json_result['list'] = [];
				for(var i in db_ret){
					var row = db_ret[i];
					var json_value = {};
					json_value['shop_id'] = row['Id'];
					json_value['shop_name'] = row['name'];
					json_value['image_url'] = row['image'];
					json_value['shop_address'] = row['address'];
					json_value['long'] = row['longitude'];
					json_value['late'] = row['latitude'];
					json_value['like_num'] = 0;
					json_value['is_like'] = false;

					json_result['list'].push(json_value);
				}
				callback(true,json_result);
			}
		});
}

exports.getShopDetail = function(shop_id,uid,callback){
	shop_id = shop_id || "";
	uid = uid || 1;
	var query_param = [shop_id,uid];
	
	connection.query("call p_get_shop_detail(?,?)",[shop_id,uid],function(err,result){
		if(err){
			logger.error(err);
			callback(false,null);
		}else{
			var shopCount = parseInt(result[0][0]['shop_num']);

			if(isNaN(shopCount) || shopCount != 1){
				logger.error("getShopDetail.Error : shopCount != 1");
				logger.log(util.inspect(result));
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

			json_result['attention_count'] = parseInt(result[3][0]['attention_num']);
			var has_attention = result[4][0]['has_attention'];
			json_result['has_attention'] = parseInt(has_attention);
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
			callback(false,[]);
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

	var query_page = parseInt(page || "1");

	var quyery_params = [query_page,10,query['city_no'],query['area_code'],query['cate_code'],query['sort_code']];
	console.log(quyery_params)
	connection.query("CALL p_get_all_shop_spread(?,?,?,?,?,?)",quyery_params,function(err,result){
		if(err){
			logger.error(err);
			callback(false,null);
		}else{
			var db_set = result[0];
			var json_result = [];
			for(var i in db_set){
				
				json_result.push(db_set[i]);
			}
			callback(true,json_result);
		}
	});
}

exports.attentionShop = function(player_id,shop_id,attention,attention_time){
	
	var sql_query_param = [player_id,shop_id,attention,attention_time];
	
	connection.query("CALL p_attention_shop(?,?,?,?)",sql_query_param,function(err,result){
		if(err){
			logger.log("MYSQL_PROXY","p_attention_shop params:" + util.inspect(sql_query_param));
			logger.error(err);
			//callback(false,null);
		}else{
			var db_result = result[0][0];
			var attention_shop_count = result[1][0]['attention_count'];
			var count = parseInt(db_result['attention_result']);
			
			var json_result = {};
			json_result['errcode'] = 2;

			if(attention == 1 && count == 1){
				json_result['errcode'] = 0;
				
			}else if(attention == 0 && count == 0){
				json_result['errcode'] = 0;
			}

			json_result['has_attention'] = count;
			json_result['attention_count'] = attention_shop_count;
			//callback(true,json_result);
		}
	});
}

exports.InsertBecomeSeller = function(uid,json_obj,callback){
	logger.log("MYSQL_PROXY",'db params:' + util.inspect(json_obj));
	var db_params = [
	uid,
	"",
	json_obj['beg'],
	json_obj['end'],

	json_obj['days'],
	json_obj['longitude'],
	json_obj['latitude'],
	json_obj['city_no'],
	json_obj['area_code'],

	json_obj['address'],
	json_obj['category_code1'],
	json_obj['category_code2'],
	json_obj['category_code3'],
	"",

	json_obj['distribution'],
	json_obj['telephone'],
	json_obj['email'],
	json_obj['qq'],
	json_obj['wx'],

	"",
	json_obj['qualification'].replace(/\\/g,"\\\\"),
	json_obj['card_image'].replace(/\\/g,"\\\\"),
	json_obj['card_number'],
	0];
	connection.query("CALL p_insert_become_seller(\
		?,?,?,?,\
		?,?,?,?,?, \
		?,?,?,?,?, \
		?,?,?,?,?, \
		?,?,?,?,?)", db_params, function(err,result){
			if(err){
				logger.error("MYSQL_PROXY",err);
				logger.error("MYSQL_PROXY",db_params);
				callback(err,{});
			}else{
				//logger.log("MYSQL_PROXY",util.inspect(result));
				callback(null,result[0][0]);
			}
		});
}

exports.getExchangeItemList = function(callback){
	connection.query("CALL p_get_all_exchange_item",function(err,result){
		var json_result = {};
		if(err){
			json_result['result'] = 1;
			callback(false,null);
		}else{
			
			json_result['result'] = 0;
			json_result['list'] = [];
			var db_result = result[0];
			for(var i in db_result){
				var obj = {};
				obj['name'] = db_result[i]['name'];
				obj['desc'] = db_result[i]['desc'];
				obj['price'] = db_result[i]['price'];
				obj['image'] = db_result[i]['image'];
				obj['id'] = db_result[i]['id'];
				json_result['list'].push(obj);
			}
			callback(true,json_result);
		}
	});
}

exports.getExchangeItemDetail = function(item_id,callback){
	connection.query("CALL p_get_exchange_item_detail(?)",[item_id],function(err,result){
		var json_result = {};
		if(err){
			json_result['result'] = 1;
			callback(false,json_result);
		}else{
			json_result['result'] = 0;

			var db_result = result[0];
			if(db_result.length > 0){
				var db_row = db_result[0];
				json_result['name'] = db_row['name'];
				json_result['desc'] = db_row['desc'];
				json_result['price'] = db_row['price'];
				json_result['image'] = db_row['image'];
				json_result['notice'] = [];

				json_result['notice'].push(db_row['notice1'] || "");
				json_result['notice'].push(db_row['notice2'] || "");
				json_result['notice'].push(db_row['notice3'] || "");
				json_result['id'] = db_row['id'];
				callback(true,json_result);
			}else{
				json_result['result'] = 2;
				callback(true,json_result);
			}
			
		}
	});
}

exports.getActivityList = function(page,size,callback)
{

	connection.query("CALL p_get_activity_list(?,?)",[page,size],function(err,result){
		
		var json_result = {};
		if(err){
			json_result['result'] = 1;
			callback(false,json_result);
		}else{

			json_result['result'] = 0;
			json_result['page'] = page;
			var db_result = result[0];
			json_result['list'] = [];
			for(var i in db_result){
				var activity = {
					'name' : db_result[i]['name'],
					'image' : db_result[i]['image'],
					'discard' : db_result[i]['discard']
				};
				json_result['list'].push(activity)
			}

			callback(true,json_result);
		}
	})
}

exports.AddNewPlayer = function(uid,telephone,password,callback){
	connection.query("CALL p_add_new_player(?,?,?)",[uid,telephone,password],function(err,result){
		if(err){
			console.log(err);
			callback(false);
		}else{
			callback(true);
		}
	});
}

exports.ChangeSex = function(uid,sex){
	connection.query("CALL p_change_player_sex(?,?)",[uid,sex],function(err,result){
		if(err){
			logger.error("MYSQL_PROXY","ChangeSex error:" + err);
		}else{
			logger.log("MYSQL_PROXY","ChangeSex success");
		}
	});
}

exports.ChangeNickName = function(uid,nick_name){
	connection.query("CALL p_change_player_nick_name(?,?)",[uid,nick_name],function(err,result){
		if(err){
			logger.error("MYSQL_PROXY","ChangeSex error:" + err);
		}else{
			
		}
	});
}

exports.ChangeBirthday = function(uid,birthday){
	connection.query("CALL p_change_player_birthday(?,?)",[uid,birthday],function(err,result){
		if(err){
			logger.error("MYSQL_PROXY","ChangeSex error:" + err);
		}else{
			
		}
	});
}

exports.ChangeSign = function(uid,sign){
	connection.query("CALL p_change_player_sign(?,?)",[uid,sign],function(err,result){
		if(err){
			logger.error("MYSQL_PROXY","ChangeSex error:" + err);
		}else{
			
		}
	});
}

exports.changeShopState = function(shop_id){
	connection.query("CALL p_change_shop_state(?)",[shop_id],function(err,result){
		if(err){
			logger.error("MYSQL_PROXY","changeShopState error:" + err);
		}else{
			logger.log("MYSQL_PROXY","[changeShopState] success!");
		}
	});
}

exports.addToFavorites = function(uid,shop_id,item_id){
	connection.query("CALL p_add_favorites_item(?,?,?)",[uid,shop_id,item_id],function(err,result){
		if(err){
			logger.error("MYSQL_PROXY","addToFavorites error:" + err);
		}else{
			logger.log("MYSQL_PROXY","addToFavorites success");
		}
	});
}

exports.changeUserInfo = function(uid,user_info_list){

	var db_params = [uid].concat(user_info_list);
	//logger.log("MYSQL_PROXY","[changeUserInfo] db_params: " + util.inspect(db_params));
	
	connection.query("CALL p_change_user_info(?,?,?,?,?,?,?,?,?,?)",db_params,function(err,result){
		if(err){
			logger.error("MYSQL_PROXY","changeUserInfo error:" + err);
			logger.log("MYSQL_PROXY","[changeUserInfo] db_params:" + util.inspect(db_params));
		}else{
			logger.log("MYSQL_PROXY","changeUserInfo success");
		}
	});
}

exports.addShopItem = function(json_value,callback){
	
	var db_params = [
	json_value['shop_id'] 
	,json_value['name']
	,json_value['price']
	,json_value['show_price']
	,json_value['show_image_1']
	,json_value['show_image_2']
	,json_value['show_image_3']
	,json_value['show_image_4']
	,json_value['detail_image_1'] 
	,json_value['detail_image_2']
	,json_value['detail_image_3']
	,json_value['detail_image_4'] 
	];
	
	
	connection.query("CALL p_add_shop_item( \
		?,?,?,?,?,\
		?,?,?,?,?,\
		?,?)",db_params,function(err,result){
			if(err){
				logger.error("MYSQL_PROXY","p_add_shop_item error:" + err);
				logger.log("MYSQL_PROXY","p_add_shop_item params:\n" + util.inspect(db_params));
				callback(err);
			}else{
				logger.log("MYSQL_PROXY","p_add_shop_item success");
				let params = {
					'id' : result[0][0]['id'],
					'shop_id':Number(json_value['shop_id']),
					'name' : json_value['name'],
					'price' : json_value['price'],
					'show_price' : json_value['show_price'],
					'is_show' : 0,
					'spread_image' : "",
					'show_images' : [json_value['show_image_1'],json_value['show_image_2'],json_value['show_image_3'],json_value['show_image_4']],
					'detail_images' : [json_value['detail_image_1'],json_value['detail_image_2'],json_value['detail_image_3'],json_value['detail_image_4']],
					'link_url' : "",
				};
				callback(null,params);
			}
		});
}

exports.saveShopBasicInfo = function(json_value,callback){
	var db_params = [json_value['shop_id'],json_value['image'],json_value['address'],json_value['telephone']];
	
	connection.query("CALL p_save_my_shop_basic_info(?,?,?,?)",db_params,function(err,result){
		if(err){
			logger.log("MYSQL_PROXY p_save_my_shop_basic_info params: \n",util.inspect(db_params));
			logger.error("MYSQL_PROXY","p_save_my_shop_basic_info error:" + err);
			callback(err,{
				'error' : 1,
				'error_msg' : "数据库更新失败",
			});
		}else{
			callback(null,result[0][0]);
		}
	});
}

exports.addShopSpreadItem = function(json_value){
	var db_params = [json_value['id'],json_value['image'],json_value['expire_time']];
	logger.log("MYSQL_PROXY",util.inspect(db_params));
	connection.query("CALL p_add_shop_spread_item(?,?,?)",db_params,function(err,result){
		if(err){
			logger.log("MYSQL_PROXY","p_add_shop_spread_item success");
		}else{
			logger.log("MYSQL_PROXY","p_add_shop_spread_item success");
		}
	});
}

exports.removeFavoritesItem = function(json_value){
	var db_params = [json_value['uid'],json_value['item_id']];
	logger.log("MYSQL_PROXY","p_remove_favorites_item params : " + util.inspect(db_params));
	connection.query("CALL p_remove_favorites_item(?,?)",db_params,function(err,result){
		if(err){
			logger.log("MYSQL_PROXY","p_remove_favorites_item success");
		}else{
			logger.log("MYSQL_PROXY","p_remove_favorites_item success");
		}
	});
}

exports.renewalActivity = function(json_value){
	var db_params = [json_value['id'],json_value['expire_time'],json_value['shop_id'],json_value['uid']];
	logger.log("MYSQL_PROXY","p_renewal_activity params : " + util.inspect(db_params));
	connection.query("CALL p_renewal_activity(?,?,?,?)",db_params,function(err,result){
		if(err){
			logger.log("MYSQL_PROXY","p_renewal_activity error:" + err);
		}else{
			logger.log("MYSQL_PROXY","p_remove_favorites_item success");
		}
	});
}

exports.addShopActivity = function(json_value){
	var db_params = [json_value['id'],json_value['name'],json_value['discard'],json_value['image']];
	connection.query("CALL p_add_activity(?,?,?,?)",db_params,function(err,result){
		if(err){
			logger.log("MYSQL_PROXY",util.inspect(db_params));
			logger.log("MYSQL_PROXY","p_add_activity error:" + err);
		}else{
			logger.log("MYSQL_PROXY","p_add_activity success");
		}
	});
}

exports.saveSellerInfo = function(json_value,callback){
	var params_hash= [
	'id'
	,'area_code'
	,'category_code1'
	,'category_code2'
	,'category_code3'
	,'beg'
	,'end'
	,'days'
	,'address'
	,'distribution'
	,'qq'
	,'wx'
	,'email'
	,'card_image'
	,'card_number'
	,'qualification'];

	var db_params = [];
	params_hash.forEach(function(key){
		db_params.push(json_value[key])
	});
	

	connection.query(
		"CALL p_save_shop_detail(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
		,db_params
		,function(err,result){
			if(err){
				logger.log("MYSQL_PROXY",util.inspect(db_params));
				logger.log("MYSQL_PROXY","p_save_shop_detail error:" + err);
				callback(err);
			}else{
				logger.log("MYSQL_PROXY","p_save_shop_detail success");
				callback(null,result[0][0]);
			}
		});
}

exports.saveShopItem = function(json_value,callback){

	var db_params = [
	json_value['id']
	,json_value['name']
	,json_value['price']
	,json_value['show_price']
	,json_value['show_image_1']// 5
	,json_value['show_image_2']
	,json_value['show_image_3']
	,json_value['show_image_4']
	,json_value['detail_image_1'] 
	,json_value['detail_image_2']// 10
	,json_value['detail_image_3']
	,json_value['detail_image_4'] // 12
	];

	logger.log("MYSQL_PROXY","db_params\n" + util.inspect(db_params));
	connection.query("CALL p_save_shop_item(?,?,?,?,?,?,?,?,?,?,?,?)",db_params,function(err,result){
		if(err){
			logger.log("MYSQL_PROXY","p_save_shop_item error:" + err);

			callback(err);
		}else{
			let item_table = result[0];
			
			
			let item_image_table = result[1];

			let json_result = {
				'id' : Number(item_table[0]['id']),
				'shop_id':Number(item_table[0]['shop_id']),
				'name' : item_table[0]['name'],
				'price' : Number(item_table[0]['price']),
				'show_price' : Number(item_table[0]['show_price']),
				'is_show' : Number(item_table[0]['is_show']),
				'spread_image' : "",
				'show_images' : [],
				'detail_images' : [],
				'link_url' : "",
			};
			for(let row_index in item_image_table){
				let db_row = item_image_table[row_index];
				let image_type = Number(db_row['image_type']);
				if(image_type == 1){
					json_result['show_images'].push(db_row['image']);
				}else if(image_type == 3){
					json_result['detail_images'].push(db_row['image']);
				}else if(image_type == 2){
					json_result['spread_image'] = db_row['image'];
				}

			}


			callback(true,json_result);
		}
	});


}

exports.saveScheduleShopCommentImage = function(uid,schedule_id,shop_id,image_index,image){
	var db_params = [uid,schedule_id,shop_id,image_index,image];
	connection.query("CALL p_save_schedule_shop_image(?,?,?,?,?)",db_params,function(err,result){
		if(err){

			logger.log("MYSQL_PROXY","p_save_schedule_shop_image error:" + err);
		}else{
			logger.log("MYSQL_PROXY","p_save_schedule_shop_image success");
		}
	});
}

exports.saveScheduleRouteImage = function(schedule_id,image){
	var db_params = [schedule_id,image];
	connection.query("CALL p_save_schedule_route_image(?,?)",db_params,function(err,result){
		if(err){
			logger.log("MYSQL_PROXY","p_save_schedule_route_image err:" + err);
			logger.log("MYSQL_PROXY","p_save_schedule_route_image params : " + db_params);
		}else{
			logger.log("MYSQL_PROXY","p_save_schedule_route_image success");
		}
	});
}

exports.updateUserInfo = function(uid,callback){
	var db_params = [uid];
	connection.query("CALL p_update_user_info(?)",db_params,function(err,result){
		if(err){
			logger.log("MYSQL_PROXY","p_update_user_info err:" + err);
			logger.log("MYSQL_PROXY","p_update_user_info params:" + util.inspect(db_params));
		}else{
			logger.log("MYSQL_PROXY","p_update_user_info success");
			callback(uid,result);
		}
	});
}

exports.changeScheduleTitle = function(schedule_id,uid,name){
	var db_params = [schedule_id,uid,name];
	connection.query("CALL p_set_schedule_name(?,?,?)",[schedule_id,uid,name],function(err,result){
		if(err){
			logger.log("MYSQL_PROXY","p_set_schedule_name err:" + err);
			logger.log("MYSQL_PROXY","p_set_schedule_name params:" + util.inspect(db_params));
		}else{
			logger.log("MYSQL_PROXY","p_set_schedule_name success");
			return;
		}
	});
}

exports.addShopToSchedule = function(uid,schedule_id,shop_id){
	var db_params = [uid,schedule_id,shop_id];
	connection.query("CALL p_add_shop_to_schedule(?,?,?)",db_params,function(err,result){
		if(err){
			logger.warn("MYSQL_PROXY","p_add_shop_to_schedule err:" + err);
			logger.log("MYSQL_PROXY","p_add_shop_to_schedule params: " + util.inspect(db_params));
		}else{
			logger.log("MYSQL_PROXY","p_add_shop_to_schedule success!");
			return;
		}
	});
}

exports.addShopItemImage = function(json_value){
	var db_params = [json_value['item_id'],json_value['index'],json_value['image']];
	connection.query("CALL p_add_shop_item_image(?,?,?)",db_params,function(err,result){
		if(err){
			logger.warn("MYSQL_PROXY","p_add_shop_item_image err:" + err);
			logger.log("MYSQL_PROXY","p_add_shop_item_image params: " + util.inspect(json_value));
		}else{
			logger.log("MYSQL_PROXY","p_add_shop_item_image success!");
			return;
		}
	})
}