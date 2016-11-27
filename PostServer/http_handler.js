const fs = require('fs');
var util = require('util');
var logger = require('../logger').logger();
var db = require("../mysqlproxy");
var PlayerProxy = require("../playerList.js");
var ShopProxy = require("../cache/shopCache.js");
var path=require('path');
var moment = require('moment');

exports.new_feed = function(fields,files,callback){
	
};

function check_dir(dirs){
	for(var key in dirs){
		var dir_name = path.join("assets",dirs[key]);
		if(!fs.existsSync(dir_name)){
			fs.mkdirSync(dir_name);
			logger.log("HTTP_HANDLER","create dir:" + dir_name);
		}
	}
}

exports.login = function(fields,files,callback){
	var login_account = fields['account'];
	var login_password = fields['password'];
	
	var json_result = {};
	var login_result = PlayerProxy.CheckLogin(login_account,login_password);
	
	if( login_result == 0){

		if(PlayerProxy.IsLogin(login_account)){
			g_playerlist.KickPlayer(login_account);
		}
		var login_response = PlayerProxy.Login(login_account);
		json_result['user_info'] = login_response;
		json_result['success'] = true;
	}else{
		json_result['success'] = false;
		json_result['error'] = login_result;
	}
	//logger.log("HTTP_HANDLER",util.inspect(json_result));

	callback(true,json_result);

}

exports.register = function(fields,files,callback){
	var step = parseInt(fields['step']);
	var telephone = fields['telephone'];
	var guid = fields['guid'] || null;
	var code = fields['code'] || null;
	var password = fields['password'] || null;
	//console.log("register start:" + util.inspect(fields));
	var result = g_playerlist.RegisterStep(step,guid,telephone,code,password);
	//console.log("register end:" + util.inspect(result));
	callback(true,result);
}

exports.changeSex = function(fields,files,callback){
	var guid = fields['guid'];
	var sex = parseInt(fields['sex']);

	var json_result = PlayerProxy.changeSex(guid,sex);
	callback(true,json_result);
}

exports.changeNickName = function(fields,files,callback){
	var guid = fields['guid'];
	var nickname = parseInt(fields['nickname']);
	var json_result = PlayerProxy.changeNickName(guid,nickname);
	callback(true,json_result);
}
exports.changeBirthday = function(fields,files,callback){
	var guid = fields['guid'];
	var birthday = fields['birthday'];
	var json_result = PlayerProxy.changeBirthday(guid,birthday);
	callback(true,json_result);
}

exports.changeSign = function(fields,files,callback){
	var guid = fields['guid'];
	var sign = fields['sign'];
	var json_result = PlayerProxy.changeSign(guid,sign);	
	callback(true,json_result);
}

exports.becomeSeller = function(fields,files,callback){

	var guid = fields['guid'];

	var uploadFile = {
		"qualification" : "shop/qualification/",
		"card_image_1" : "shop/card/",
		"card_image_2" : "shop/card/"
	};

	check_dir(uploadFile);

	logger.log("HTTP_HANDLER","[becomeSeller][params] fields:" + util.inspect(fields));

	var fieldNameToDbColName = {
		'beg' : {
			'name' : 'beg',
			'type' : 'int'
		},
		'end' : {
			'name' : 'end',
			'type' : 'int'
		},
		'days' : {
			'name' : 'days',
			'type' : 'int'
		},
		'address' : {
			'name' : 'address',
			'type' : 'string'
		},
		'telephone': {
			'name': 'telephone',
			'type' : 'string'
		},
		'area_code': {
			'name' : 'area_code',
			'type' : 'int'
		},
		'distribution':{
			'name' : 'distribution',
			'type' : 'string'
		},
		'category_code1' : {
			'name' : 'category_code1',
			'type' : 'int'
		},
		'category_code2' : {
			'name' : 'category_code2',
			'type' : 'int'
		},
		'category_code3' : {
			'name' : 'category_code3',
			'type' : 'int'
		},
		'qq' : {
			'name' : 'qq',
			'type' : 'string'
		},
		'wx' : {
			'name' : 'wx',
			'type' : 'string'
		},
		'email' : {
			'name' : 'email',
			'type' : 'string'
		},
		'longitude':{
			'name' : 'longitude',
			'type' : 'float'
		},
		'latitude':{
			'name' : 'latitude',
			'type' : 'float'
		},
		'city_no' : {
			'name' : 'city_no',
			'type' : 'int'
		}
	}
	var shopInfo = {};
	for(var file_key in uploadFile){
		var upload_file = files[file_key];
		//logger.log("HTTP_HANDLER",file_key + "=" + util.inspect(files[file_key]));
		if(upload_file != null) {
			var virtual_file_name = path.join(uploadFile[file_key],path.basename(upload_file.path));
			var newPath = path.join("assets",virtual_file_name);
			fs.renameSync(upload_file.path, newPath);
			shopInfo[file_key] = path.join(virtual_file_name);
			//logger.log("HTTP_HANDLER",file_key + ":" + virtual_file_name);
		}
		
	} 

	for(var key in fieldNameToDbColName){
		var key_info = fieldNameToDbColName[key];
		if(key in fields){
			if(key_info['type'] == "int"){
				shopInfo[key_info['name']] = parseInt(fields[key]);
				//logger.log("HTTP_HANDLER","key = " + key + ", value = " + fields[key]);
			}else if(key_info['type'] == 'string'){
				shopInfo[key_info['name']] = fields[key];
			}else if(key_info['type'] == 'float'){
				shopInfo[key_info['name']] = parseFloat(fields[key]);
			}
		}else{
			if(key_info['type'] == "int"){
				shopInfo[key_info['name']] = 0;
				//logger.log("HTTP_HANDLER","key = " + key + ", value = " + fields[key]);
			}else if(key_info['type'] == 'string'){
				shopInfo[key_info['name']] = "未填写";
			}else if(key_info['type'] == 'float'){
				shopInfo[key_info['name']] = 0.0;
			}
		}
		
	}

	var json_result = {
		'error' : 0
	};
	//logger.log("HTTP_HANDLER","[becomeSeller][params] shopInfo: " + util.inspect(shopInfo));
	
	var find_uid = PlayerProxy.CheckSeller(guid);
	
	if(find_uid > 0){
		var shop_info = ShopProxy.InsertBecomeSeller(find_uid,shopInfo);
		if(shop_info != null){
			PlayerProxy.SetUserShopId(guid,shop_info['id']);
			if(shop_info['id'] > 0){
				
				db.InsertBecomeSeller(find_uid,shop_info);
				json_result['shop_id'] = shop_info['id'];
			}else{
				json_result['error'] = 2;
			}
		}
	}else{
		json_result['error'] = 1;
	}
	logger.log("HTTP_HANDLER","[becomeSeller][params] json_result: " + util.inspect(json_result));

	callback(true,json_result);
}

exports.changeShopState = function(fields,files,callback){
	var guid = fields['guid'];
	var shopId = PlayerProxy.changeShopState(guid);
	var json_result = {};
	if(shopId > 0){
		ShopProxy.changeShopState(shopId);
		db.changeShopState(shopId);
		json_result['error'] = 0;
	}else{
		json_result['error'] = 1;
	}
	callback(true,""); 
}

exports.attentionShop = function(fields,files,callback){
	if(! 'guid' in fields){
		callback(true,{
			'error' : 1001
		});
		return;
	}

	var guid = fields['guid'];
	var shop_id = Number(fields['shop_id']);

	var player_attention_shop_info = PlayerProxy.attentionShop(guid,shop_id);

	var json_result = {
		
	};
	if(player_attention_shop_info != null && player_attention_shop_info['error'] == 0){
		var result = ShopProxy.attentionShop(player_attention_shop_info['uid'],shop_id);
		if(result != null){
			db.attentionShop(player_attention_shop_info['uid'],shop_id,1,player_attention_shop_info['attention_time']);
			json_result['shop_info'] = result;
			json_result['error'] = 0;
		}else{
			json_result['error'] = 1004;
		}
	}else if(player_attention_shop_info == null){
		json_result['error'] = 1001;
	}else{
		json_result['error'] = player_attention_shop_info['error'];
	}
	//这里应该返回关注商铺的基本信息
	callback(true,json_result);
}

exports.addToFavorites = function(fields,files,callback){
	var guid = fields['guid'];

	var shop_id = fields['shop_id'];
	var item_id = fields['item_id'];
	var check_has_item = ShopProxy.CheckHasItem(shop_id,item_id);
	var json_result = {};
	
	if(check_has_item == true){

		var uid = PlayerProxy.addToFavorites(guid,shop_id,item_id);
		if(uid > 0){
			db.addToFavorites(uid,shop_id,item_id);
			json_result['error'] = 0;
		}else{
			json_result['error'] = 3;
		}
		
		json_result['shop_id'] = shop_id;
		json_result['item_id'] = item_id;
	}else{
		json_result['error'] = 1;
	}

	callback(true,json_result);
}

exports.changeUserInfo =function(fields,files,callback){

	
	var json_result = {
		'error' : 0
	};
	var key_field = ['nick_name','sex','birthday','sign','address','email','name','telephone','verify_code'];

	for(var key in key_field){
		if(! key in fields){
			json_result['error'] = 2;
			json_result['miss_key'] = key;
			break;
		}
	}

	if(moment(fields['birthday']).isAfter(moment(Date.now()))){
		json_result['error'] = 3;
	}


	if(json_result['error'] != 0){
		callback(true,json_result);
		return;
	}

	if(json_result['error'] != 0){
		callback(true,json_result);
		return;
	}

	var guid = fields['guid'];
	var uid = PlayerProxy.getUid(guid);



	if(uid != null){
		var list_result = [];

		list_result.push(fields['nick_name']);
		list_result.push(fields['sex']);
		list_result.push(fields['birthday']);
		list_result.push(fields['sign']);
		list_result.push(fields['address']);
		list_result.push(fields['email']);
		list_result.push(fields['name']);
		list_result.push(fields['telephone']);
		list_result.push(fields['verify_code']);

		PlayerProxy.changeUserInfo(uid,list_result);
		db.changeUserInfo(uid,list_result);

		json_result['error'] = 0;
		json_result['nick_name'] = fields['nick_name'];
		json_result['sex'] = fields['sex'];
		json_result['birthday'] = fields['birthday'];
		json_result['sign'] = fields['sign'];
		json_result['address'] = fields['address'];
		json_result['email'] = fields['email'];
		json_result['name'] = fields['name'];
		json_result['telephone'] = fields['telephone'];
		
	}else{
		json_result['error'] = 1;
	}

	callback(true,json_result);
}

exports.addShopItem = function(fields,files,callback){
	var guid = fields['guid'];
	var json_result = {};
	var shop_id = PlayerProxy.getShopId(guid);

	if(shop_id != null && shop_id > 0){
		
		var uploadFileKey = {
			"image" : "shop/item/",
			"image1" : "shop/item/",
			"image2" : "shop/item/",
			"image3" : "shop/item/",
			"image4" : "shop/item/"
			
		};
		check_dir(uploadFileKey);
		var image = {};
		//logger.log("HTTP_HANDLER",util.inspect(files));
		for(var file_key in uploadFileKey){
			if(file_key in files){
				var upload_file = files[file_key];
				logger.log("HTTP_HANDLER",util.inspect(upload_file));
				var virtual_file_name = path.join(uploadFileKey[file_key],path.basename(upload_file.path));
				var newPath = path.join("assets",virtual_file_name);
				fs.renameSync(upload_file.path, newPath);
				image[file_key] = path.join(virtual_file_name);
			}else{
				image[file_key] = '';
			}
		} 
		//logger.log("HTTP_HANDLER",util.inspect(fields));
		var price = Number(fields['price']);
		var show_price = Number(fields['show_price']);

		var my_item_info = ShopProxy.addShopItem(shop_id,fields['name'],price,show_price,image['image'],image['image1'],image['image2'],image['image3'],image['image4']);
		
		//logger.log("HTTP_HANDLER", "ShopProxy.addShopItem return:" + item_id);
		
		if(my_item_info != null){
			var shop_image = image['image'].replace(/\\/g,"\\\\");
			var shop_image1 = image['image1'].replace(/\\/g,"\\\\");
			var shop_image2 = image['image2'].replace(/\\/g,"\\\\");
			var shop_image3 = image['image3'].replace(/\\/g,"\\\\");
			var shop_image4 = image['image4'].replace(/\\/g,"\\\\");

			db.addShopItem(shop_id,my_item_info['item_id'],[shop_image,shop_image1,shop_image2,shop_image3,shop_image4],fields['name'],parseFloat(fields['price']),parseFloat(fields['show_price']));
			json_result['item_info'] = my_item_info;
			json_result['error'] = 0;
		}else{
			json_result['error'] = 2;
		}
		

	}else{
		json_result['error'] = 1;
	}
	logger.log("HTTP_HANDLER",util.inspect(my_item_info));
	callback(true,json_result);
}

exports.saveShopBasicInfo = function(fields,files,callback){
	var json_result = {};
	var uploadFileKey = {
		"image" : "shop/image/",
	};
	
	var image = {};
	for(var file_key in uploadFileKey){
		if(file_key in files){
			var upload_file = files[file_key];
			var virtual_file_name = path.join(uploadFileKey[file_key],path.basename(upload_file.path));
			var newPath = path.join("assets",virtual_file_name);
			var newDir = path.join("assets",uploadFileKey[file_key]);
			if(!fs.existsSync(newDir)){
				fs.mkdirSync(newDir);
			}

			fs.renameSync(upload_file.path, newPath);
			image[file_key] = path.join(virtual_file_name).replace(/\\/g,"\\\\");
		}else{
			image[file_key] = '';
		}
	} 


	var json_result = ShopProxy.saveShopBasicInfo(fields['guid'],image['image'],fields['address'],fields['telephone']);
	if(json_result != null){
		db.saveShopBasicInfo(json_result);
		callback(true,json_result);
		return;
	}
	callback(true,{});
}

exports.addShopSpreadItem = function(fields,files,callback){
	var json_result = {};
	var uploadFileKey = {
		"image" : "shop/image/",
	};
	check_dir(uploadFileKey);
	var image = {};
	for(var file_key in uploadFileKey){
		if(file_key in files){
			var upload_file = files[file_key];

			var virtual_file_name = path.join(uploadFileKey[file_key],path.basename(upload_file.path));
			var newPath = path.join("assets",virtual_file_name);
			fs.renameSync(upload_file.path, newPath);
			image[file_key] = path.join(virtual_file_name).replace(/\\/g,"\\\\");
		}else{
			image[file_key] = '';
		}
	}

	var json_result = ShopProxy.addShopSpreadItem(fields['item_id'],fields['item_id'],image['image'],fields['month']);
	
	if(json_result != null){
		db.addShopSpreadItem(json_result);
	}

	callback(true,json_result);
}

exports.addShopActivity = function(fields,files,callback){

	var json_result = {};

	var uploadFileKey = {
		"image" : "shop/activity/",
	};
	
	check_dir(uploadFileKey);

	var image = {};
	for(var file_key in uploadFileKey){
		if(file_key in files){
			var upload_file = files[file_key];
			var virtual_file_name = path.join(uploadFileKey[file_key],path.basename(upload_file.path));
			var newPath = path.join("assets",virtual_file_name);

			fs.renameSync(upload_file.path, newPath);
			image[file_key] = path.join(virtual_file_name).replace(/\\/g,"\\\\");
		}else{
			image[file_key] = '';
		}
	}

	var json_result = ShopProxy.addShopActivity(fields['guid'],fields['title'],fields['discard'],image['image']);
	if(json_result != null){
		db.addShopActivity(json_result);
	}
	callback(true,json_result);
}

exports.removeFavoritesItem = function(fields,files,callback){
	if('guid' in fields && 'id' in fields){
		var json_result = PlayerProxy.removeFavoritesItem(fields['guid'],Number(fields['id']));
		if(json_result != null){
			json_result['error'] = 0;
			db.removeFavoritesItem(json_result);
			callback(true,json_result);
			return;
		}
	}

	var json_result = {
		'error' : 1
	};
	callback(true,json_result);

	return;
}

exports.renewal = function(fields,files,callback){
	var json_result = {
		'error' : 10002
	};

	if('guid' in fields){
		var type = Number(fields['renewal_type']);
		if(type == 1){
			var num = Number(fields['num']);
			var check_result = PlayerProxy.checkRenewalActivity(fields['guid'],num);
			if(check_result['error'] == 0){
				check_result['num'] = num;
				json_result = ShopProxy.renewalActivity(check_result);
				if(json_result != null){
					db.renewalActivity(json_result);
				}
				json_result['error'] = 0;
			}
			
		}
	}

	callback(true,json_result);
}

exports.saveShopDetail = function(fields,files,callback){
	var json_result = {};

	if('guid' in fields){
		var params_type = {
			'area_code' : 'INT',
			'category_code1' : 'INT',
			'category_code2' : 'INT',
			'category_code3' : 'INT',
			'beg' : 'INT',
			'end' : 'INT',
			'days' : 'INT',
			'address' : 'STRING',
			'distribution' : 'STRING',
			'qq' : 'STRING',
			'wx' : 'STRING',
			'email' : 'STRING'
		};
		//console.log("fields:" + util.inspect(fields));

		var shop_id = PlayerProxy.getShopId(fields['guid']);
		var uid = PlayerProxy.getUid(fields['guid']);
		var params = {};
		for(var key in params_type){
			if(key in fields){
				if(params_type[key] == 'INT'){
					params[key] = Number(fields[key]);
				}
				if(params_type[key] == 'STRING'){
					params[key] = fields[key];
				}
				if(params_type[key] == 'FLOAT'){
					params[key] = parseFloat(fields[key]);
				}
			}else{
				if(params_type[key] == 'INT'){
					params[key] = 0;
				}
				if(params_type[key] == 'STRING'){
					params[key] = "";
				}
				if(params_type[key] == 'FLOAT'){
					params[key] = 0.0;
				}
			}
		}

		var uploadFileKey = {
			'card_image_1' : 'shop/card/',
			'card_image_2' : 'shop/card/'
		};

		for(var key in uploadFileKey){
			if(key in files){
				var upload_file = files[key];
				var parse_result = path.parse(upload_file.path);

				var virtual_file_name = path.join(uploadFileKey[key],parse_result['base']);
				var newPath = path.join("assets",virtual_file_name);
				var newDir = path.join("assets",uploadFileKey[key]);
				if(!fs.existsSync(newDir)){
					fs.mkdirSync(newDir);
				}
				fs.renameSync(upload_file.path, newPath);
				params[key] = virtual_file_name.replace(/\\/g,"\\\\");
			}else{
				params[key] = "";
			}
		}
		params['id'] = shop_id;

		var save_result = ShopProxy.saveShopDetail(params);
		
		if(save_result != null){
			db.saveShopDetail(params);
		}

		json_result = {
			'shop_id':shop_id,
			'shop_info':save_result
		};
		//console.log("json_result:" + util.inspect(json_result));
	}else{
		json_result['error'] = 1;
	}
	callback(true,json_result);
}

exports.saveShopItem = function(fields,files,callback){
	
	logger.log("HTTP_HANDLER",util.inspect(fields));

	if(!'guid' in fields){
		var json_result = {
			'error' : 2
		}
		callback(true,json_result);
		return;
	}

	var shop_id = PlayerProxy.getShopId(fields['guid']);

	if(shop_id <= 0){
		var json_result = {
			'error' : 3
		}
		callback(true,json_result);
		return;
	}

	var params = {};

	var params_type = {
		'id':'INT',
		'price' : 'FLOAT',
		'name' : 'STRING',
		'show_price' : 'FLOAT',
		'property_value_0' : 'STRING',
		'property_value_1' : 'STRING',
		'property_value_2' : 'STRING',
		'property_value_3' : 'STRING',
		'property_value_4' : 'STRING',
		'property_value_5' : 'STRING',
		'property_value_6' : 'STRING',
		'property_value_7' : 'STRING',
		'property_value_8' : 'STRING',
		'property_value_9' : 'STRING',
		'property_name_0' : 'STRING',
		'property_name_1' : 'STRING',
		'property_name_2' : 'STRING',
		'property_name_3' : 'STRING',
		'property_name_4' : 'STRING',
		'property_name_5' : 'STRING',
		'property_name_6' : 'STRING',
		'property_name_7' : 'STRING',
		'property_name_8' : 'STRING',
		'property_name_9' : 'STRING',
	};

	var uploadFileKey = {
		'image_1' : 'shop/image/',
		'image_2' : 'shop/image/',
		'image_3' : 'shop/image/',
		'image_4' : 'shop/image/',
		'image_5' : 'shop/image/',
		'image_6' : 'shop/image/',
		'image_7' : 'shop/image/',
		'image_8' : 'shop/image/',
	}

	

	for(var key in params_type){
		if(key in fields){
			if(params_type[key] == 'INT'){
				params[key] = Number(fields[key]);
			}else if(params_type[key] == 'FLOAT'){
				params[key] = parseFloat(fields[key]);
			}else{
				params[key] = fields[key];
			}
		}
	}

	for(var key in uploadFileKey){
		if(key in files){
			var upload_file = files[key];
			var parse_result = path.parse(upload_file.path);

			var virtual_file_name = path.join(uploadFileKey[key],parse_result['base']);
			var newPath = path.join("assets",virtual_file_name);
			var newDir = path.join("assets",uploadFileKey[key]);
			if(!fs.existsSync(newDir)){
				fs.mkdirSync(newDir);
			}
			fs.renameSync(upload_file.path, newPath);
			params[key] = virtual_file_name.replace(/\\/g,"\\\\");
		}else{
			params[key] = "";
		}
	}

	params['shop_id'] = shop_id;

	var json_result = ShopProxy.saveShopItem(params);

	if(json_result != null){
		json_result['error'] = 0;
		var db_params = ShopProxy.getMyShopItemDbParams(json_result['item_id']);
		//logger.log("HTTP_HANDLER","db_params:" + util.inspect(db_params));
		if(db_params != null){
			db.saveShopItem(db_params);
		}
		
	}
	if(json_result == null){
		json_result = {
			'error' : 1
		}
	}

	callback(true,json_result);
	return;

}

exports.cancelAttentionShop = function(fields,files,callback){
	logger.log("HTTP_HANDLER","[cancelAttentionShop] start ");

	if(!'guid' in fields){
		var json_result = {
			'error' : 2
		}

		callback(true,json_result);
		return;
	}

	if(!'shop_id' in fields){
		var json_result = {
			'error' : 3
		}
		callback(true,json_result);
		return;
	}

	var player_info = PlayerProxy.cancelAttentionShop(fields['guid'],fields['shop_id']);
	if(player_info != null && 'uid' in player_info && player_info['uid'] > 0){
		ShopProxy.cancelAttentionShop(player_info['uid'],fields['shop_id']);
		db.attentionShop(player_info['uid'],fields['shop_id'],0,moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'));

		callback(true,{
			'error' : 0,
			'shop_id' : fields['shop_id']
		});

		return;
	}
	if(player_info!=null && 'error' in player_info){
		callback(true,{
			'error' : player_info['error']
		});
		return;
	}
	callback(true,{
		'error' : 1003
	});
	return;



	

}