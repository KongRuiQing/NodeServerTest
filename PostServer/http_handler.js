const fs = require('fs');
var util = require('util');
var logger = require('../logger').logger();
var db = require("../mysqlproxy");
var PlayerProxy = require("../playerList.js");
var ShopProxy = require("../cache/shopCache.js");
var path=require('path');

exports.new_feed = function(fields,files,callback){
	
};

exports.login = function(fields,files,callback){
	var login_account = fields['account'];
	var login_password = fields['password'];
	
	var json_result = {};
	if(g_playerlist.CheckLogin(login_account,login_password)){

		if(g_playerlist.IsLogin(login_account)){
			g_playerlist.KickPlayer(login_account);
		}
		var login_response = PlayerProxy.Login(login_account);
		json_result['user_info'] = login_response;
		json_result['success'] = true;
	}else{
		json_result['success'] = false;
	}

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
	console.log("register end:" + util.inspect(result));
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

	var shopInfo = {};
	var uploadFile = {
		"shop_image":"shop/image/",
		"ad_image":"shop/ad/"
	};
	var uploadFileName = {
		'shop_image' : "image",
		'ad_image' : "ad_image"
	}

	for(var file_key in files){
		var File = files[file_key];
		var virtual_file_name = path.join(uploadFile[file_key],path.basename(File.path));
		var newPath = path.join("assets",virtual_file_name);
		fs.renameSync(File.path, newPath);
		shopInfo[uploadFileName[file_key]] = path.join(virtual_file_name);
	}

	shopInfo['name'] = fields['name'];
	shopInfo['beg'] = parseInt(fields['open_time']);
	shopInfo['end'] = parseInt(fields['close_time']);
	//shopInfo['img'] = "";
	shopInfo['longitude'] = parseFloat(fields['longitude']);
	shopInfo['latitude'] = parseFloat(fields['latitude']);
	shopInfo['area_code'] = parseInt(fields['area_code']);
	shopInfo['category_code'] = parseInt(fields['category_code']);
	shopInfo['city_no'] = parseInt(fields['city_no']);
	
	shopInfo['telephone'] = fields['telephone'];
	shopInfo['info'] = fields['desc'];
	
	shopInfo['address'] = "";
	shopInfo['near_image'] = "";
	shopInfo['qq'] = "";
	shopInfo['wx'] = "";
	shopInfo['image_in_attention'] = "";

	shopInfo['shop_manager_name'] = fields['shop_manager_name'];
	shopInfo['shop_manager_telephone'] = fields['shop_manager_telephone'];
	shopInfo['shop_manager_address'] = fields['shop_manager_address'];
	shopInfo['shop_manager_card'] = fields['shop_manager_card'];
	shopInfo['shop_manager_email'] = fields['shop_manager_email'];

	var json_result = {
		'error' : 0
	};

	var find_uid = PlayerProxy.CheckSeller(guid);
	if(find_uid > 0){
		var shopId = ShopProxy.InsertBecomeSeller(find_uid,shopInfo);
		PlayerProxy.SetUserShopId(guid,shopId);
		if(shopId > 0){
			db.InsertBecomeSeller(find_uid,shopInfo);
			json_result['shop_id'] = shopId;
		}else{
			json_result['error'] = 2;
		}
	}else{
		json_result['error'] = 1;
	}
	logger.log("HTTP_HANDLER","[becomeSeller]" + util.inspect(json_result));

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
	var guid = fields['guid'];
	var shop_id = parseInt(fields['shop_id']);
	var uid = PlayerProxy.attentionShop(guid,shop_id);
	var json_result = {
		'error' : 0
	};
	if(uid > 0){
		ShopProxy.attentionShop(uid,shop_id);
		db.attentionShop(uid,shop_id,1);
		json_result['shop_id'] = shop_id;
	}else if(uid == 0){
		json_result['error'] = 1;
	}else{
		json_result['error'] = 2;
	}
	callback(true,json_result);
}

exports.addToFavorites = function(fields,files,callback){
	var guid = fields['guid'];

	var shop_id = fields['shop_id'];
	var item_id = fields['item_id'];
	var check_has_item = ShopProxy.CheckHasItem(shop_id,item_id);
	var json_result = {};
	console.log(check_has_item);
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