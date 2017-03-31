'use strict';

var Sequelize = require("sequelize");

var sequelize = new Sequelize('find', 'eplus-find', 'eplus-find', {
	host: '139.224.227.82',
	port:3306,
	dialect: 'mysql'
});

var UserLogin = sequelize.import("./model/user_login.js");
var ShopModel = sequelize.import("./model/ShopModel.js");
//var TestModel = sequelize.import("./model/TestModel.js");
var UserModel = sequelize.import("./model/UserModel.js");
var ClaimModel = sequelize.import("./model/ClaimModel.js")
exports.TestFindOrCreate = function(name){
	
}

exports.updateUserLogin = function(id,longitude,latitude){
	UserLogin.update({
		'longitude' : longitude,
		'latitude' : latitude,
	},{
		'where':{
			'id':id
		}
	}).then(function(affected_numbers,result1){
		console.log(affected_numbers);
		console.log(result1);
	});
}

exports.insertRequestBeSeller = function(jsonObject,callback){
	ShopModel.findOrCreate({
		'defaults' : {
			'name' : jsonObject['shop_name'],
			'uid' : jsonObject['uid'],
			'beg' : jsonObject['beg'],
			'end' : jsonObject['end'],
			'days' : jsonObject['end'],
			'area_code' : jsonObject['area_code'],
			'city_no' : jsonObject['city_no'],
			'category_code1' : jsonObject['category_code1'],
			'category_code2' : jsonObject['category_code2'],
			'category_code3' : jsonObject['category_code3'],
			'address' : jsonObject['address'],
			'telephone' : jsonObject['telephone'],
			'user_name':jsonObject['user_name'],
			'card_num' : jsonObject['card_num'],
			'card_image' : jsonObject['card_image'],
			'state' : 1,
		},
		'where':{
			'Id' : null,
		}
	}).then(function(Instance,created){
		let dbRow = Instance[0]['dataValues'];
		callback(null,dbRow);
	});
}

exports.saveSellerInfo = function(jsonObject,callback){

	var value = {
		'name' : jsonObject['name'],
		'city_no' : jsonObject['city_no'],
		'area_code' : jsonObject['area_code'],
		'category_code1' : jsonObject['category_code1'],
		'category_code2' : jsonObject['category_code2'],
		'category_code3' : jsonObject['category_code3'],
		'beg' : jsonObject['beg'],
		'end' : jsonObject['end'],
		'days' : jsonObject['days'],
		'address' : jsonObject['address'],
		'telephone' : jsonObject['telephone'],
		'business' : jsonObject['business'],
		'distribution' : jsonObject['distribution'],
		'fix_telephon' : jsonObject['fix_telephon'],
		'qq' : jsonObject['qq'],
		'wx' : jsonObject['wx'],
		'email' : jsonObject['email'],
		'longitude' : jsonObject['longitude'],
		'latitude' : jsonObject['latitude'],
	};
	if('qualification' in jsonObject){
		value['qualification'] = jsonObject['qualification'];
	}
	let images = ['image1','image2','image3','image4'];
	for(var key in images){
		let image_key = images[key];
		if(image_key in jsonObject){
			value[image_key] = jsonObject[image_key];
		}
	}
	
	
	ShopModel.update(value,{
		'where':{
			'Id':jsonObject['id']
		}
	}).then(function(affected_numbers,result1){
		console.log(result1);

		callback(null,jsonObject);
	});
}

exports.insertClaimInfo = function(jsonObject,callback){
	ClaimModel.findOrCreate({
		'defaults' : jsonObject,
		'where' : {
			'id' : null,
		},
	}).then(function(Instance,created){
		let dbRow = Instance[0]['dataValues'];
		callback(null,dbRow);
	});
}

exports.uploadShopBigImage = function(shop_id,image,callback){
	let jsonObject = {
		'big_image' : image,
	};
	ShopModel.update(jsonObject,{
		'where' : {
			'id' : shop_id,
		}
	}).then(function(affected_numbers,result){
		if(affected_numbers == 1){
			callback(null);
		}else{
			callback("数据库操作失败");
		}
	});
}