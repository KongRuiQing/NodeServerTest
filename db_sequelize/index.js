'use strict';

var Sequelize = require("sequelize");

var sequelize = new Sequelize('find', 'eplus-find', 'eplus-find', {
	host: '139.224.227.82',
	port:3306,
	dialect: 'mysql'
});

var UserLogin = sequelize.import("./model/user_login.js");
var ShopModel = sequelize.import("./model/ShopModel.js");
var TestModel = sequelize.import("./model/TestModel.js");
var UserModel = sequelize.import("./model/UserModel.js");
exports.TestFindOrCreate = function(name){
	TestModel.findOrCreate({
		'defaults':{
			'name' : name	
		},
		'where' : {
			'id' : null,
		}
		
	}).then(function(Instance,created){
		console.log(Instance);
	});
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