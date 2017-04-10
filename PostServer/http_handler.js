'use strict';

const fs = require('fs');
var util = require('util');
var logger = require('../logger').logger();
var db = require("../mysqlproxy");
var PlayerProxy = require("../playerList.js");
var ShopProxy = require("../cache/shopCache.js");
var path=require('path');
var moment = require('moment');

let BASE_SHOP_IMAGE = "../../www/SaySystemWeb/Files";

let db_sequelize = require("../db_sequelize");

let HeadInstance = require("../HttpHeadInstance");

exports.new_feed = function(header,fields,files,callback){
	
};

function check_dir(dirs){
	for(var key in dirs){
		var dir_name = path.join(BASE_SHOP_IMAGE,dirs[key]);
		if(!fs.existsSync(dir_name)){
			fs.mkdirSync(dir_name);
			logger.log("HTTP_HANDLER","create dir:" + dir_name);
		}
	}
}

function upload_file_to_json(files,map,result){

	check_dir(map[file_key]);
	for(var file_key in map){
		if(file_key in files){
			let upload_file = files[file_key];
			let virtual_file_name = path.join(map[file_key],path.basename(upload_file.path));
			let newPath = path.join(BASE_SHOP_IMAGE,virtual_file_name);
			fs.renameSync(upload_file.path, newPath);
			result[file_key] = path.join('Files',virtual_file_name).replace(/\\/g,"\\\\");
		}
	} 
}

exports.login = function(header,fields,files,callback){
	var login_account = fields['account'];
	var login_password = fields['password'];
	
	var json_result = {};
	
	var login_result = PlayerProxy.CheckLogin(login_account,login_password);
	
	if( login_result == 0){
		var login_response = PlayerProxy.Login(login_account);

		//db_sequelize.updateLogin(,1,header['longitude'],header['latitude']);

		json_result['user_info'] = login_response;
		json_result['account'] = login_account;
		json_result['password'] = login_password;
		json_result['success'] = true;
	}else{
		json_result['success'] = false;
		json_result['error'] = login_result;
	}
	//logger.log("HTTP_HANDLER",util.inspect(json_result));

	callback(true,json_result);

}



exports.register = function(header,fields,files,callback){
	var step = parseInt(fields['step']);
	var telephone = fields['telephone'];
	var cuid = fields['cuid'] || null;
	var code = fields['code'] || null;
	var password = fields['password'] || null;
	//console.log("register start:" + util.inspect(fields));
	var result = PlayerProxy.RegisterStep(step,cuid,telephone,code,password);
	//console.log("register end:" + util.inspect(result));
	callback(true,result);
}

exports.changeSex = function(header,fields,files,callback){
	var guid = fields['guid'];
	var sex = parseInt(fields['sex']);

	var json_result = PlayerProxy.changeSex(guid,sex);
	callback(true,json_result);
}

exports.changeNickName = function(header,fields,files,callback){
	var guid = fields['guid'];
	var nickname = parseInt(fields['nickname']);
	var json_result = PlayerProxy.changeNickName(guid,nickname);
	callback(true,json_result);
}
exports.changeBirthday = function(header,fields,files,callback){
	var guid = fields['guid'];
	var birthday = fields['birthday'];
	var json_result = PlayerProxy.changeBirthday(guid,birthday);
	callback(true,json_result);
}

exports.changeSign = function(header,fields,files,callback){
	var guid = fields['guid'];
	var sign = fields['sign'];
	var json_result = PlayerProxy.changeSign(guid,sign);	
	callback(true,json_result);
}

exports.becomeSeller = function(header,fields,files,callback){

	
	var uid = header['uid'];

	var uploadFile = {
		"card_image" : "shop/card/",
	};

	//check_dir(uploadFile);

	var fieldNameToDbColName = {
		'shop_name' : {
			'name' : 'shop_name',
			'type' : 'string'
		},
		'city_no' : {
			'name' : 'city_no',
			'type' : 'int',
		},
		'area_code': {
			'name' : 'area_code',
			'type' : 'int'
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
		'card_name' : {
			'name' : 'user_name',
			'type' : 'string'
		},
		'card_number' : {
			'name' : 'card_number',
			'type' : 'string'
		}
	}
	var shopInfo = {};

	upload_file_to_json(files,uploadFile,shopInfo);
	
	for(var key in fieldNameToDbColName){
		var key_info = fieldNameToDbColName[key];
		if(key in fields){
			if(key_info['type'] == "int"){
				shopInfo[key_info['name']] = Number(fields[key]);
				//logger.log("HTTP_HANDLER","key = " + key + ", value = " + fields[key]);
			}else if(key_info['type'] == 'string'){
				shopInfo[key_info['name']] = fields[key];
			}else if(key_info['type'] == 'float'){
				shopInfo[key_info['name']] = Number(fields[key]);
			}
		}else{
			if(key_info['type'] == "int"){
				shopInfo[key_info['name']] = 0;
				//logger.log("HTTP_HANDLER","key = " + key + ", value = " + fields[key]);
			}else if(key_info['type'] == 'string'){
				shopInfo[key_info['name']] = "";
			}else if(key_info['type'] == 'float'){
				shopInfo[key_info['name']] = 0.0;
			}
		}
		
	}
	
	
	
	if(uid > 0){

		let shop_id = PlayerProxy.getInstance().getMyShopId(uid);
		if(shop_id != 0){
			logger.log("WARN",'uid:',uid,' request be seller where shop_id:',shop_id);
			callback(true,{
				'error' : 1,
				'error_msg' : '用户已经有商铺了,不能再申请',
			});
			return;
		}
		shopInfo['uid'] = uid;
		
		db_sequelize.insertRequestBeSeller(shopInfo,function(err,db_row){
			if(err){
				logger.error(err);
				callback(true,{
					'error' : 2,
					'error_msg' : "数据库失败",
				});
				return;
			}

			ShopProxy.getInstance().InsertBecomeSeller(uid,db_row);

			PlayerProxy.getInstance().SetUserShopId(uid,db_row['Id'],db_row['state']);

			callback(true,{
				'error' : 0,
				'shop_id' : db_row['Id'],
				'state' : 1,
			});
		});

		
		return;
		
	}
	callback(true,{
		'error' : 1,
		'error_msg' : '用户没有登录',
	});	
}

exports.changeShopState = function(header,fields,files,callback){
	var guid = fields['guid'];
	var shopId = PlayerProxy.getShopId(guid);
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

exports.attentionShop = function(header,fields,files,callback){
	logger.log("HTTP_HANDLER","[attentionShop][params] fields:" + util.inspect(fields));
	if(! 'guid' in fields){
		callback(true,{
			'error' : 1001
		});
		return;
	}

	var guid = fields['guid'];
	var shop_id = Number(fields['shop_id']);

	var player_attention_shop_info = PlayerProxy.attentionShop(guid,shop_id);
	
	var json_result = {};

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

exports.addToFavorites = function(header,fields,files,callback){
	var guid = fields['guid'];

	var shop_id = fields['shop_id'];
	var item_id = fields['item_id'];
	var check_has_item = ShopProxy.CheckHasItem(shop_id,item_id);
	var json_result = {};
	
	if(check_has_item == true){

		var uid = PlayerProxy.addToFavorites(guid,shop_id,item_id);
		ShopProxy.addFavoritesUser(shop_id,item_id,uid);
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

exports.changeUserInfo =function(header,fields,files,callback){

	
	var json_result = {
		'error' : 0
	};
	var key_field = ['nick_name','sex','birthday','sign','address','email','name','telephone'];

	if(moment(fields['birthday']).isAfter(moment(Date.now()))){
		json_result['error'] = 1007;
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

	var uploadFileKey = {
		"head_image" : "player/"
	};
	check_dir(uploadFileKey);
	var image = {};


	upload_file_to_json(files,uploadFileKey,image);



	if(uid != null){
		var list_result = [];

		list_result.push(fields['nick_name']); //0
		list_result.push(fields['sex']); //1
		list_result.push(fields['birthday']); //2
		list_result.push(fields['sign']); //3
		list_result.push(fields['address']);//4
		list_result.push(fields['email']);//5
		list_result.push(fields['name']);//6
		list_result.push(fields['telephone']);//7
		//list_result.push(fields['verify_code']); //8
		list_result.push(image['head_image']); //8

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
		json_result['head_image'] = image['head_image'];

	}else{
		json_result['error'] = 1;
	}

	callback(true,json_result);
}

exports.addShopItem = function(header,fields,files,callback){
	

	var uid = header['uid'];

	var shop_id = PlayerProxy.getInstance().getMyShopId(uid);

	if(shop_id > 0){

		let dest_dir = "shop/item/";
		check_dir([dest_dir]);
		let json_image = [];
		for(var key = 1; key <= 4; ++key){
			let upload_file_key = "show_image_" + key;
			if(upload_file_key in files){
				let upload_file = files[upload_file_key];
				let virtual_file_name = path.join(dest_dir,path.basename(upload_file.path));
				let newPath = path.join(BASE_SHOP_IMAGE,virtual_file_name);
				fs.renameSync(upload_file.path, newPath);
				json_image.push({
					'image_type' : 1,
					'index' : key - 1,
					'image' : path.join("Files",virtual_file_name).replace(/\\/g,"\\\\")
				});
			}else if(upload_file_key in fields){
				json_image.push({
					'image_type' : 1,
					'index' : key - 1,
					'image' : ""
				});
			}
		}
		for(var key = 1; key <= 4; ++key){
			let upload_file_key = "detail_image_" + key;
			if(upload_file_key in files){
				let upload_file = files[upload_file_key];
				let virtual_file_name = path.join(dest_dir,path.basename(upload_file.path));
				let newPath = path.join(BASE_SHOP_IMAGE,virtual_file_name);
				fs.renameSync(upload_file.path, newPath);
				json_image.push({
					'image_type' : 3,
					'index' : key - 1,
					'image' : path.join('Files',virtual_file_name).replace(/\\/g,"\\\\")
				});
			}else if(upload_file_key in fields){
				json_image.push({
					'image_type' : 1,
					'index' : key - 1,
					'image' : ""
				});
			}
		}
		logger.log("INFO","[HTTP_HANDLER][addShopItem] json_image : ", util.inspect(json_image));

		let category_code = Number(fields['category_code']);
		var price = Number(fields['price']);
		var show_price = Number(fields['show_price']);
		let item_name = fields['name'];
		let link = fields['link'];
		let group_index = Number(fields['group_index']);

		let json_value = {};
		json_value['category_code'] = category_code;
		json_value['price'] = price;
		json_value['show_price'] = show_price;
		json_value['name'] = item_name;
		json_value['shop_id'] = shop_id;
		json_value['link'] = link;
		json_value['group_index'] = group_index;

		let json_propertys = [];
		for(var index = 0; index < 8; ++index){
			let property_type_key = "item_property_type_" + index;
			let property_value_key = "item_property_value_" + index;
			if(property_value_key in fields && property_value_key in fields){
				json_propertys.push({
					'property_type' : fields[property_type_key],
					'property_value' : fields[property_value_key],
					'is_show' : 1,
					'index' : index,
				});
			}
		}

		db_sequelize.addShopItem(json_value,json_image,json_propertys,function(err,add_item_id){
			if(err){
				logger.log("WARN","[HTTP_HANDLER][addShopItem] json_value:",util.inspect(json_value));
				callback(true,{
					'error' : 2,
					'error_msg' : err,
				});
				return;
			}else{
				logger.log("INFO",'[HTTP_HANDLER][addShopItem]'
					,'add_item_id:',add_item_id);

				json_value['id'] = add_item_id;
				ShopProxy.getInstance().addShopItem(json_value,json_image,json_propertys);
				let shop_item_info = ShopProxy.getInstance().getMyShopItemInfo(add_item_id);

				if(shop_item_info != null){
					callback(true,{
						'error' : 0,
						'item_info' : shop_item_info,
					});
				}else{
					callback(true,{
						'error' : 1,
						'error_msg' : "添加商品失败",
					});
				}
			}
		});
		return;
	}else{
		callback(true,{
			'error' : 1,
			'error_msg' : "没有找到商铺信息",
		});
		return;
	}
	callback(true,{
		'error' : 10,
		'error_msg' : "系统错误",
	});
	return;
	
}

exports.saveMyShopBasicInfo = function(header,fields,files,callback){
	var json_result = {};
	var uploadFileKey = {
		"image" : "shop/image/",
	};
	
	var image = {};
	upload_file_to_json(files,uploadFileKey,image);

	var uid = header['uid'];
	let shop_id = PlayerProxy.getInstance().getMyShopId(uid);
	let json_param = {
		'shop_id' : shop_id,
		'image' : image['image'],
		'address' : fields['address'],
		'telephone' : fields['telephone'],
	};
	db.saveShopBasicInfo(json_param,function(err,result){
		if(err){
			callback(true,err);
			logger.error("HTTP_HANDLER",err);
			return;
		}
		ShopProxy.getInstance().saveShopBasicInfo(shop_id,result);
		logger.log("HTTP_HANDLER","shop_id:" + shop_id + " uid:" + uid);
		callback(true,ShopProxy.getInstance().getMyShopBasicInfo(uid,false));
	});
	return;
}

exports.addShopSpreadItem = function(header,fields,files,callback){
	var json_result = {};
	var uploadFileKey = {
		"image" : "shop/image/",
	};
	check_dir(uploadFileKey);
	var image = {};
	upload_file_to_json(files,uploadFileKey,image);


	var json_result = ShopProxy.addShopSpreadItem(fields['item_id'],fields['item_id'],image['image'],fields['month']);
	
	if(json_result != null){
		db.addShopSpreadItem(json_result);
	}

	callback(true,json_result);
}

exports.addShopActivity = function(header,fields,files,callback){

	var json_result = {};

	var uploadFileKey = {
		"image" : "shop/activity/",
	};
	
	check_dir(uploadFileKey);

	var image = {};
	upload_file_to_json(files,uploadFileKey,image);

	var json_result = ShopProxy.addShopActivity(fields['guid'],fields['title'],fields['discard'],image['image']);
	if(json_result != null){
		db.addShopActivity(json_result);
	}
	callback(true,json_result);
}

exports.removeFavoritesItem = function(header,fields,files,callback){
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

exports.renewal = function(header,fields,files,callback){
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

exports.saveSellerInfo = function(header,fields,files,callback){
	var json_result = {};

	var params_type = {
		'name' : 'STRING',
		'city_no' : 'INT',
		'area_code' : 'INT',
		'category_code1' : 'INT',
		'category_code2' : 'INT',
		'category_code3' : 'INT',
		'beg' : 'INT',
		'end' : 'INT',
		'days' : 'INT',
		'address' : 'STRING',
		'telephone' : 'STRING',
		'business' : 'STRING',
		'distribution' : 'STRING',
		'fix_telephont' : 'STRING',
		'qq' : 'STRING',
		'wx' : 'STRING',
		'email' : 'STRING',
		'longitude' : 'FLOAT',
		'latitude' : 'FLOAT',
	};


	var shop_id = PlayerProxy.getInstance().getMyShopId(header['uid']);

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
		'qualification' : 'shop/qualification/',
		'image1' : 'shop/image/',
		'image2' : 'shop/image/',
		'image3' : 'shop/image/',
		'image4' : 'shop/image/',
	};

	upload_file_to_json(files,uploadFileKey,params);


	for(var key in uploadFileKey){
		if(key in fields){
			params[key] = fields[key];
		}
	}
	console.log("fields:",util.inspect(fields));
	console.log("params:" + util.inspect(params));

	
	params['id'] = shop_id;

	db_sequelize.saveSellerInfo(params,function(err,result){
		if(err){
			logger.error(err);
			callback(true,err);
			return;
		}else{
			ShopProxy.getInstance().updateSellerInfo(result);
			callback(true,{
				'error' : 0,
				'shop_info' : ShopProxy.getInstance().getMyShopSellerInfo(result['id'])
			});
			return;
		}
	});
	return;

}

exports.saveShopItem = function(header,fields,files,callback){

	let Tag = '[HTTP_HANDLER][saveShopItem]';
	logger.log("INFO",Tag,'fields:',util.inspect(fields));

	let json_result = {};


	var shop_id = PlayerProxy.getInstance().getMyShopId(header['uid']);

	if(shop_id <= 0){
		logger.log("WARN",Tag,'find shop error','uid',header['uid']);
		callback(true,{
			'error':1,
			'error_msg' : '没有找到商铺信息',
		});
		return;
	}

	let item_id = Number(fields['id']);

	let dest_dir = "shop/item/";

	check_dir([dest_dir]);
	let json_image = [];
	for(var key = 1; key <= 4; ++key){
		let upload_file_key = "show_image_" + key;
		if(upload_file_key in files){
			let upload_file = files[upload_file_key];
			let virtual_file_name = path.join(dest_dir,path.basename(upload_file.path));
			let newPath = path.join(BASE_SHOP_IMAGE,virtual_file_name);
			fs.renameSync(upload_file.path, newPath);
			json_image.push({
				'image_type' : 1,
				'index' : key - 1,
				'image' : path.join("Files",virtual_file_name).replace(/\\/g,"\\\\"),
				'item_id' : item_id,
			});
		}else if(upload_file_key in fields){
			json_image.push({
				'image_type' : 1,
				'index' : key - 1,
				'image' : "",
				'item_id' : item_id,
			});
		}
	}
	for(var key = 1; key <= 4; ++key){
		let upload_file_key = "detail_image_" + key;
		if(upload_file_key in files){
			let upload_file = files[upload_file_key];
			let virtual_file_name = path.join(dest_dir,path.basename(upload_file.path));
			let newPath = path.join(BASE_SHOP_IMAGE,virtual_file_name);
			fs.renameSync(upload_file.path, newPath);
			json_image.push({
				'image_type' : 3,
				'index' : key - 1,
				'image' : path.join('Files',virtual_file_name).replace(/\\/g,"\\\\"),
				'item_id' : item_id,
			});
		}else if(upload_file_key in fields){
			json_image.push({
				'image_type' : 1,
				'index' : key - 1,
				'image' : "",
				'item_id' : item_id,
			});
		}
	}
	logger.log("INFO",Tag," json_image : ", util.inspect(json_image));

	let category_code = Number(fields['category_code']);
	var price = Number(fields['price']);
	var show_price = Number(fields['show_price']);
	let item_name = fields['name'];
	let link = fields['link'];
	

	let json_value = {};
	json_value['category_code'] = category_code;
	json_value['price'] = price;
	json_value['show_price'] = show_price;
	json_value['name'] = item_name;
	json_value['shop_id'] = shop_id;
	json_value['link'] = link;
	
	let json_propertys = [];
	for(var index = 0; index < 8; ++index){
		let property_type_key = "item_property_type_" + index;
		let property_value_key = "item_property_value_" + index;
		if(property_value_key in fields && property_value_key in fields){
			json_propertys.push({
				'property_type' : fields[property_type_key],
				'property_value' : fields[property_value_key],
				'is_show' : 1,
				'index' : index,
				'item_id' : item_id,
			});
		}
	}

	json_value['shop_id'] = shop_id;
	json_value['id'] = item_id;

	db_sequelize.saveShopItem(json_value,json_image,json_propertys,function(err){
		
		if(err != null){
			logger.log("WARN",Tag,"db error:",err);
			callback(true,{});
			return;
		}else{
			logger.log("INFO",Tag,"aaaaa");
			try{
				ShopProxy.getInstance().saveShopItem(json_value,json_image,json_propertys);

				let shop_item_info = ShopProxy.getInstance().getMyShopItemInfo(item_id);
				
				if(shop_item_info != null){
					callback(true,{
						'error' : 0,
						'item_info' : shop_item_info,
					});
				}else{
					callback(true,{
						'error' : 1,
						'error_msg' : "更新商品信息",
					});
				}
			}catch(err){
				logger.log("WARN",Tag,err);
				callback(true,{
					'error' : 3,
					'error_msg' : '服务器内部错误'
				});
			}
			
			return;

		}
	})
	return;

}

exports.cancelAttentionShop = function(header,fields,files,callback){
	logger.log("HTTP_HANDLER","[cancelAttentionShop][fields] params : " + util.inspect(fields));

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
		logger.warn("HTTP_HANDLER","[cancelAttentionShop] error : " + player_info['error']);
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

exports.uploadScheduleImage = function(header,fields,files,callback){
	logger.log("HTTP_HANDLER","uploadScheduleImage fields:" + util.inspect(fields));
	if(!'guid' in fields){
		var json_result = {
			'error' : 1001
		}

		callback(true,json_result);
		return;
	}
	if(!'schedule_id' in fields ){
		var json_result = {
			'error' : 1013
		}

		callback(true,json_result);
		return;
	}
	if(!'type' in fields){
		var json_result = {
			'error' : 1016
		};
		callback(true,json_result);
		return;
	}
	var type = Number(fields['type']);
	if(type == 2){
		if(!'shop_id' in fields ){
			var json_result = {
				'error' : 1014
			}

			callback(true,json_result);
			return;
		}
		if(!'image_index' in fields ){
			var json_result = {
				'error' : 1015
			}
			callback(true,json_result);
			return;
		}
	}

	var uploadFileKey = {
		'image' : 'user/schedule/'
	}
	var params = {};
	upload_file_to_json(files,uploadFileKey,params);
	
	var guid = fields['guid'];
	var image = params['image'];
	var schedule_id = Number(fields['schedule_id']);

	if(type == 2){


		var shop_id = Number(fields['shop_id']);
		var image_index = Number(fields['image_index']);

		var json_value = PlayerProxy.ChangeScheduleImage(
			guid
			,schedule_id
			,shop_id
			,image_index
			,image);

		if(json_value == null){
			var json_result = {
				'error' : 1015
			}
			callback(true,json_result);
			return;
		}else{

			db.saveScheduleShopCommentImage(json_value['uid'],schedule_id,shop_id,image_index,image);
			var json_result = {
				'error' : 0,
				'type' : type,
				'schedule_id'　: schedule_id,
				'shop_id' : shop_id,
				'image_index' : image_index,
				'image' : image 
			}
			callback(true,json_result);
		}
	}else{
		var json_value = PlayerProxy.ChangeScheduleRouteImage(guid,schedule_id,image);
		if(json_value != null){
			//logger.log("HTTP_HANDLER","uploadScheduleImage json_value : " + util.inspect(json_value));
			db.saveScheduleRouteImage(schedule_id,image);

			var json_result = {
				'error' : 0,
				'type' : type,
				'schedule_id' : schedule_id,
				'image' : image
			}
			logger.log("HTTP_HANDLER","uploadScheduleImage json_result : " + util.inspect(json_result));
			callback(true,json_result);
			return;
		}else{
			var json_result = {
				'error' : 1017
			}
			callback(true,json_result);
			return;
		}
	}
}

exports.changeScheduleTitle = function(header,fields,files,callback){

	if(!'guid' in fields){
		let json_result = {
			'error' : 1001
		}

		callback(true,json_result);
		return;
	}
	if(!'name' in fields){
		let json_result = {
			'error' : 1001
		}
		callback(true,json_result);
		return;
	}

	if(!'schedule_id' in fields){
		let json_result = {
			'error' : 1001
		}
		callback(true,json_result);
		return;
	}


	let schedule_id = Number(fields['schedule_id']);
	let schedule_name = fields['name'];
	let guid = fields['guid'];
	let json_value = PlayerProxy.changeScheduleTitle(guid,schedule_id,schedule_name);
	if(json_value != null){
		db.changeScheduleTitle(schedule_id,json_value['uid'],schedule_name);
	}
	let json_result = {
		'error' : 0,
		'schedule_id' : schedule_id,
		'name' : schedule_name
	};
	callback(true,json_result);
	return;
}

exports.addShopToSchedule = function(header,fields,files,callback){
	logger.log("HTTP_HANDLER","[addShopToSchedule] params: " + util.inspect(fields));
	let json_result = {};
	if(! 'guid' in fields){
		json_result = {
			'error' : 1001
		}
		callback(true,json_result);
		return;
	}
	if(! 'shop_id' in fields){
		json_result = {
			'error' : 1022
		}
		callback(true,json_result);
		return;
	}

	if(! 'schedule_id' in fields){
		json_result = {
			'error' : 1023
		}
		callback(true,json_result);
		return;
	}

	let guid = fields['guid'];
	let shop_id = Number(fields['shop_id']);
	let schedule_id = Number(fields['schedule_id']);

	let json_value = PlayerProxy.addShopToSchedule(guid,shop_id,schedule_id);
	if(json_value != null){
		if('error' in json_value){
			json_result['error'] = json_value['error'];
		}else{
			// success
			db.addShopToSchedule(json_value['uid'],schedule_id,shop_id);
			
			let shop_schedule_info = ShopProxy.getShopScheduleInfo(shop_id);
			json_result['schedule_id'] = schedule_id;
			json_result['add_result'] = {
				'shop_id' : shop_id,
				'shop_info' : shop_schedule_info,
				'schedule_info' : PlayerProxy.getScheduleShopCommentInfo(guid,schedule_id,shop_id)
			}
		}
	}

	callback(true,json_result);
	return;
}

exports.removeShopFromSchedule = function(header,fields,files,cb){
	logger.log("HTTP_HANDLER","[removeShopFromSchedule] params: " + util.inspect(fields));
	let json_result = {};

	if(! 'guid' in fields){
		json_result = {
			'error' : 1001
		}
		callback(true,json_result);
		return;
	}
	if(! 'shop_id' in fields){
		json_result = {
			'error' : 1022
		}
		callback(true,json_result);
		return;
	}

	if(! 'schedule_id' in fields){
		json_result = {
			'error' : 1023
		}
		callback(true,json_result);
		return;
	}

	let guid = fields['guid'];
	let shop_id = Number(fields['shop_id']);
	let schedule_id = Number(fields['schedule_id']);

	let json_value = PlayerProxy.removeShopFromSchedule(guid,shop_id,schedule_id);

	if(json_value != null){
		if('error' in json_value){
			json_result['error'] = json_value['error'];
		}else{
			// success
			db.removeShopFromSchedule(json_value['uid'],schedule_id,shop_id);
		}
	}else{
		logger.error("HTTP_HANDLER","[removeShopFromSchedule] error");
	}

	cb(true,json_result);

}

exports.setShopItemImage = function(header,fields,files,cb){
	logger.log("HTTP_HANDLER","[removeShopFromSchedule] params: " + util.inspect(fields));

	let json_result = {};
	if(! 'guid' in fields){
		json_result['error'] = 1001;
	}
	if(! 'item_id' in fields){
		json_result['error'] = 1026;
	}
	if(! 'index' in fields){
		json_result['error'] = 1027;
	}

	var uploadFileKey = {
		'image' : 'user/schedule/'
	}
	var params = {};
	upload_file_to_json(fiels,uploadFileKey,params);



	if('error' in json_result){
		cb(true,json_result);
		return;
	}

	let item_id = fields['item_id'];
	let index = fields['index'];
	let image = params['image'];
	let json_value = shopCache.setShopItemImage(item_id,index,image);
	if(json_value != null){
		db.addShopItemImage(json_value);
		json_result['index'] = index;
		json_result['item_id'] = item_id;
		json_result['image'] = image;
	}else{
		json_result['error'] = 1025
	}
	cb(true,json_result);
}

exports.claimShop = function(header,fields,files,cb){
	logger.log("HTTP_HANDLER","[claimShop] params: " + util.inspect(fields));
	if(!('uid' in header)){
		cb(true,{
			'error' : 1001,
			'error_msg' : '没有登录',
		});
		return;
	}
	let shop_id = fields['shop_id'];

	if(!ShopProxy.getInstance().chekcCanClaim(shop_id)){
		cb(true,{
			'error' : 1001,
			'error_msg' : '商铺已经被人认领了',
		});
		return;
	}
	if(!PlayerProxy.getInstance().chekcCanClaim(header['uid'])){
		cb(true,{
			'error' : 1001,
			'error_msg' : '只能同时认领一个商铺',
		});
		return;
	}


	let json_param = {
		'name' : fields['name'],
		'telephone' : fields['telephone'],
		'uid' : header['uid'],
		'shop_id' : fields['shop_id'],
	};

	db_sequelize.insertClaimInfo(json_param,function(err,db_row){
		let uid = Number(db_row['uid']);
		let shop_id = Number(db_row['shop_id']);
		ShopProxy.getInstance().setClaimShop(uid,shop_id);
		PlayerProxy.getInstance().setClaimShop(uid,shop_id);
		cb(true,{
			'claim_shop_id' : shop_id,
		});
		HeadInstance.getInstance().emit('shop_claim',shop_id);
	});

}