'use strict';

const fs = require('fs');
var util = require('util');
var logger = require('../logger').logger();
var db = require("../mysqlproxy");
var PlayerProxy = require("../playerList.js");
var ShopProxy = require("../cache/shopCache.js");
var path=require('path');
var moment = require('moment');
let ErrorCode = require("../error.js");
let BASE_SHOP_IMAGE = "../../www/SaySystemWeb/Files";

let db_sequelize = require("../db_sequelize");

let HeadInstance = require("../HttpHeadInstance");
let Ws = require("../WebSocketServer");
let LoginModule = require("../Logic/login.js");
let RegisterService = require("../Logic/register.js");
var OnlineService = require("../Logic/online.js");
const Joi = require('joi');
let AttentionService = require("../Logic/Attentions.js");

exports.new_feed = function(header,fields,files,callback){
	
};

var ShopService = require("../Logic/shop.js");

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
			logger.log("INFO","[POST_SERVER][upload_file_to_json] files:",result[file_key]);
		}
	} 

	logger.log("INFO","end upload_file_to_json");
}



exports.logout = function(header,fields,files,callback){
	let uid = Number(header['uid']);
	if(uid > 0){
		PlayerProxy.getInstance().logout();	
	}

	callback(true,{
		'error' : 0
	});
}



exports.register = function(header,fields,files,callback){

	let telephone = fields['telephone'];
	if(LoginModule.checkAccount(telephone)){
		callback(true,{
			'error' : 1,
		});
		return;
	}

	let step = parseInt(fields['step']);
	
	if(step == 1){
		let register_id = RegisterService.createRegisterInfo(telephone);
		logger.log("INFO","[POST_SERVER][register]:",`step:${step},register_id:${register_id}`);
		callback(true,{
			'step' : 2,
			'register_id' : register_id,
		});
		return;
	}else if(step == 2){
		let register_id = fields['register_id'];
		let verify_code = fields['verify_code'];
		logger.log("INFO","[POST_SERVER][register]:",`step:${step},register_id:${register_id},verify_code:${verify_code}`);
		let result = RegisterService.checkVerifyCode(register_id,telephone,verify_code);
		if(!result){
			callback(true,{
				'error' : 1018,
			});
			return;
		}else{
			callback(true,{
				'step' : 3
			});
		}
	}else if(step == 3){
		let password = fields['password'];
		let register_id = fields['register_id'];
		
		let socket_id = fields['socket_id'];

		logger.log("INFO","[POST_SERVER][register]:",`step:${step},register_id:${register_id},password ${password}`);
		RegisterService.removeRegisterInfo(register_id);
		db_sequelize.registerPlayer({
			'telephone' : telephone,
			'password' : password,
			'longitude' : header['longitude'],
			'latitude' : header['latitude'],
		},(logininfo,userinfo)=>{
			logger.log("INFO","[POST_SERVER][register] db_result",logininfo,userinfo);

			LoginModule.addLoginInfo(logininfo['Account'],logininfo['Id'],logininfo['Password'],logininfo['state']);

			PlayerProxy.getInstance().addUserInfo(userinfo);

			let guid = OnlineService.registerLogin(logininfo['Id'],socket_id);

			let user_info = PlayerProxy.getInstance().getUserInfo(logininfo['Id']);


			callback(true,{
				'step' : 4,
				'user_info' : user_info,
				'guid' : guid,
			});
		});
	}
	
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

	let Tag = "[POST_SERVER][http_handler][becomeSeller]";
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
		},
		'cs' : {
			'name' : 'cs',
			'type' : 'int',
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
		let check_result = ShopService.checkBeShop(uid);
		if(check_result > 0){
			callback(true,{
				'error' : 1,
				'error_msg' : '用户已经有商铺了,不能再申请',
			});
			return;
		}
		
		shopInfo['uid'] = uid;

		ShopService.requestBeShop(shopInfo,(err,db_row)=>{

			if(err){
				logger.error(err);
				callback(true,{
					'error' : 2,
					'error_msg' : "数据库失败",
				});
				return;
			}

			//ShopProxy.getInstance().addShop(db_row);
			//PlayerProxy.getInstance().SetUserShopId(uid,db_row['Id'],db_row['state']);

			callback(true,{
				'error' : 0,
				'shop_id' : db_row['Id'],
				'state' : 0,
			});
		});
		
		

		
		return;
		
	}else{
		logger.log("ERROR",Tag,'uid is 0');
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
	logger.log("INFO","[attentionShop][params] fields:" + util.inspect(fields));
	

	let uid = header['uid'];
	if(uid <= 0){
		callback(true,{
			'error' : ErrorCode.NOT_LOGIN,
			'error_msg' : "没有登录",
		});
		return;
	}
	var shop_id = Number(fields['shop_id']);
	let is_attention = Number(fields['is_attention']);

	let player_attention_shop_info = AttentionService.isAttentionThisShop(uid,shop_id);
	
	if(player_attention_shop_info == is_attention){
		callback(true,{
			'error' : 1,
			'error_msg' : '操作重复',
		});
		return;
	}
	if(!is_attention){
		let _uid = ShopService.getUidByShopId(shop_id);
		if(uid == _uid){
			callback(true,{
				'error' : 1,
				'error_msg' : '操作重复',
			});
			return;
		}
	}

	let json_value = {
		'uid' : uid,
		'shop_id' : shop_id,
	};

	db_sequelize.playerAttentionShop(json_value,is_attention,function(err){
		if(err){
			logger.log("WARN",err);
			callback(true,{
				'error' : 2,
				'error_msg' : '数据库失败',
			});
			return;
		}else{

			AttentionService.attentionShop(uid,shop_id,is_attention);
			let attention_num = AttentionService.getShopAttentionNum(shop_id);
			//PlayerProxy.getInstance().attentionShop(uid,shop_id,is_attention);
			//ShopProxy.getInstance().addAttention(uid,shop_id,is_attention);

			let result = ShopProxy.getInstance().getShopAttentionInfo(uid,shop_id);
			HeadInstance.getInstance().emit('/shop_attention',uid,shop_id);
			callback(true,{
				'error' : 0,
				'shop_info' : {
					'shop_id' : json_value['shop_id'],
					'is_attention' : is_attention,
					'attention_num' : attention_num,
				}
			});
			return;
		}
	});
}

exports.addToFavorites = function(header,fields,files,callback){
	var guid = fields['guid'];

	var shop_id = fields['shop_id'];
	var item_id = fields['item_id'];
	var check_has_item = ShopProxy.getInstance().CheckHasItem(shop_id,item_id);
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
	let uid = header['uid'];
	if(uid <= 0 || uid == null ){
		callback(true,{
			'error' : ErrorCode.USER_NO_LOGIN,
		});
		return;
	}
	const schema = Joi.object().keys({
		'nick_name': Joi.string().required(),
		'sex': Joi.number().empty(''),
		'birthday' : Joi.string().empty(''),
		'sign' : Joi.string().empty(''),
		'address' : Joi.string().empty(''),
		'email' : Joi.string().empty(''),
		'name' : Joi.string().empty(''),
		'telephone' : Joi.string().empty(''),
		'time_stamp' : Joi.number(),
	});
	const result = Joi.validate(fields, schema);
	if(result.error){
		callback(true,{
			'error' : ErrorCode.FIELD_PARAM_ERROR,
			'error_msg' : result.error,
		});
		return;
	}

	

	var uploadFileKey = {
		"head" : "player/"
	};
	
	var image = {};

	upload_file_to_json(files,uploadFileKey,image);

	if(uid > 0){
		let db_row = {
			'name' : fields['nick_name'],
			'sex' : fields['sex'],
			'birthday_timestamp' : fields['birthday'],
			'sign' : fields['sign'],
			'address' : fields['address'],
			'email' : fields['email'],
			'real_name' : fields['name'],
			'telephone' : fields['telephone'],
		};
		if('head' in image){
			db_row['head'] = image['head'];
		}

		db_sequelize.saveUserInfo(uid,db_row,(error)=>{
			PlayerProxy.getInstance().changeUserInfo(uid,db_row);
			callback(true,{
				'error' : 0,
				'user_info': PlayerProxy.getInstance().getUserInfo(uid),
			});
		});
	}
}

exports.addShopItem = function(header,fields,files,callback){
	

	var uid = Number(header['uid']);

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
				logger.log("INFO",'[HTTP_HANDLER][addShopItem]','add_item_id:',add_item_id);

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
		logger.log("WARN",'shop_id:',shop_id,'uid:',uid);
		callback(true,{
			'error' : 1,
			'error_msg' : "没有找到商铺信息",
		});
		return;
	}
	
	return;
	
}

exports.removeShopItem = function(header,fields,files,callback){
	var uid = Number(header['uid']);

	var shop_id = PlayerProxy.getInstance().getMyShopId(uid);

	let item_id = Number(fields['item_id']);
	logger.log("INFO",`[POST_SERVER][removeShopItem] uid ${uid},shop_id ${shop_id},item_id ${item_id}`);
	if(shop_id > 0){
		let check = ShopProxy.getInstance().isShopItem(shop_id,item_id);
		if(check){
			db_sequelize.removeShopItem(item_id,(error,db_result)=>{
				if(error){
					callback(true,{
						'error' : 2,
					});
				}else{
					ShopProxy.getInstance().removeShopItem(item_id);
					callback(true,{
						'error' : 0
					});
				}
			});
		}else{
			callback(true,{
				'error' : 3,
			})
		}
	}else{
		callback(true,{
			'error' : 1,
		});
	}
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
		'shop_name' : 'STRING',
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
		'uid' : Number.parseInt(header['uid']),
		'shop_id' : Number.parseInt(fields['shop_id']),
		'cs' : Number(fields['cs']),
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

exports.offShelveShopItem = function(header,fields,files,cb){
	let uid = Number(header['uid']);
	let i = 0;
	let key = "item_" + i;
	let items = [];
	while(key in fields){
		logger.log('INFO','key:',key,'field:',fields[key]);
		items.push(fields[key]);
		i = i + 1;
		key = "item_" + i;
		if(i >= 18){
			break;
		}
	};
	if(!('state' in fields)){
		cb(true,{
			'error' : 3,
			'error_msg' : '参数错误',
		});
		return;
	}
	let state = Number(fields['state']);
	if(Number.isNaN(state)){
		cb(true,{
			'error' : 3,
			'error_msg' : '指定下架的一个物品并不是自己商铺的',
		});
		return;
	}
	let shop_id = PlayerProxy.getInstance().getMyShopId(uid);


	let out_my_shop_item = items.some(function(item_id){
		let b = ShopProxy.getInstance().isShopItem(shop_id,item_id);
		if(!b){
			return true;
		}
		return false;
	});

	if(out_my_shop_item){
		cb(true,{
			'error' : 3,
			'error_msg' : '指定下架的一个物品并不是自己商铺的',
		});
		return;
	}

	db_sequelize.offShelveShopItem(items,state,function(error,off_shelve_shop_items){
		if(error){
			logger.log("ERROR",error);
			cb(true,{
				'error' : 2,
				'error_msg' : '数据库失败',
			});
			return;
		}else{
			ShopProxy.getInstance().offShelveShopItem(shop_id,off_shelve_shop_items,state);
			cb(true,{
				'items' : off_shelve_shop_items,
			});
			return;
		}
	});

}

exports.closeShop = function(header,fields,files,cb){
	let uid = Number(header['uid']);
	//let shop_id = PlayerProxy.getInstance().getMyShopId(uid);
	//logger.log("INFO",`[POST_SERVER][closeShop] params shop_id:${shop_id}`);
	//

	ShopService.closeShop(uid,(error)=>{
		if(error){
			cb(true,{
				'error' : 2,
			});
			return;
		}else{
			//PlayerProxy.getInstance().closeShop(uid);
			//ShopProxy.getInstance().closeShop(shop_id);
			cb(true,{
				'error' : 0,
			});
		}
		
	});
}