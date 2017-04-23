'use strict';

var Sequelize = require("sequelize");
var util = require("util");
var sequelize = new Sequelize('find', 'eplus-find', 'eplus-find', {
	host: '139.224.227.82',
	port:3306,
	dialect: 'mysql'
});

var UserLogin = sequelize.import("./model/user_login.js");
var ShopModel = sequelize.import("./model/ShopModel.js");
//var TestModel = sequelize.import("./model/TestModel.js");
var UserModel = sequelize.import("./model/UserModel.js");
var ClaimModel = sequelize.import("./model/ClaimModel.js");
var ItemModel = sequelize.import("./model/ItemModel.js");
var ItemImageModel = sequelize.import("./model/ItemImageModel.js");
var ItemPropertyModel = sequelize.import("./model/ItemPropertyModel.js");
var UserAttentionModel = sequelize.import("./model/UserAttentionModel.js");

exports.TestFindOrCreate = function(name){
	
}


exports.testUpdate = function(itemImages){
	
	Promise.all([updateItemImageModel({'image' : 'a','id' : 38}),updateItemImageModel({'image' : 'b','id' : 39})]).then(function(result){
		console.log(result);
	})
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
			'cs_id' : jsonObject['cs'],
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

function updateManyItemImage(item_image){
	return new Promise(function(resolve, reject){
		console.log('item_image',item_image);
		ItemImageModel.upsert(item_image,{
			'where' : {
				'item_id' : item_image['item_id'],
				'image_type' : item_image['image_type'],
				'index' : item_image['index'],
			}
		}).then(function(affectedCount, affectedRows){
			resolve(affectedCount);
		})
	});
}

function updateManyItemProperty(item_property){
	return new Promise(function(resolve,reject){
		ItemPropertyModel.upsert(item_property,{
			'where' : {
				'item_id' : item_property['item_id'],
				'index' : item_property['index'],
			}
		}).then(function(affectedCount,affectedRows){
			resolve(affectedCount);
		});
	});
}

exports.saveShopItem = function(jsonItem,jsonImages,jsonPropertys,callback){
	Promise.resolve(true)
	.then(function(){
		return new Promise(function(resolve, reject){
			ItemModel.update(jsonItem,{
				'where' : {
					'id' : jsonItem['id'],
				}
			}).then(function(affectedCount){
				console.log(affectedCount);
				if(affectedCount[0] == 1){
					resolve();
				}else{
					reject();
				}
			});
		});
	})
	.then(function(){
		let array_Promise = [];
		jsonImages.forEach(function(image){
			array_Promise.push(updateManyItemImage(image));

		});
		
		return Promise.all(array_Promise);
	})
	.then(function(){
		
		let array_property_Promise = [];
		jsonPropertys.forEach(function(property){
			array_property_Promise.push(updateManyItemProperty(property));
		});

		return Promise.all(array_property_Promise);
		
	}).then(function(){

		callback(null);
	});
}

exports.addShopItem = function(jsonItem,jsonImages,jsonPropertys,callback){
	ItemModel.findOrCreate({
		'defaults' : jsonItem,
		'where' : {
			'id' : null,
		}
	}).then(function(dbResult){
		
		if(dbResult[1]){
			let dbRow = dbResult[0]['dataValues'];
			let id = dbRow['id'];
			for(var key in jsonImages){
				jsonImages[key]['item_id'] = id;
			}
			
			ItemImageModel.bulkCreate(jsonImages).then(function(){
				for(var key in jsonPropertys){
					jsonPropertys[key]['item_id'] = id;
				}
				ItemPropertyModel.bulkCreate(jsonPropertys).then(function(){
					callback(null,id);
				});
			});
			return;
		}else{
			callback("create failed");
		}
		
	});
}

exports.playerAttentionShop = function(jsonAttention,is_attention,callback){
	if(is_attention){
		UserAttentionModel.upsert(jsonAttention)
		.then(function(created){
			callback(null,created);
		});
	}else{
		UserAttentionModel.destroy({
			'where' : jsonAttention
		}).then(function(num){
			callback(null,num);
		});
	}
}