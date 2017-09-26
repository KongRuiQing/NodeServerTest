'use strict';

var Sequelize = require("sequelize");
var util = require("util");
var sequelize = new Sequelize('find', 'eplus-find', 'eplus-find', {
	host: '139.224.227.82',
	port: 3306,
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
var FavoriteMode = sequelize.import("./model/FavoriteMode.js");
var VerifyCodeInfo = sequelize.import("./model/VerifyCodeInfo.js");
var GroupMsgModel = sequelize.import("./model/GroupMsgModel.js");
var GroupChatModel = sequelize.import("./model/GroupChatModel.js");
var UserAttentionModel = sequelize.import("./model/UserAttentionModel.js");
var ShopActivityModel = sequelize.import("./model/ShopActivityModel.js");
var ShopImageModel = sequelize.import("./model/ShopImageModel.js");
var UserMessageModel = sequelize.import("./model/UserMessageModel.js");

exports.TestFindOrCreate = function(name) {

}


exports.testUpdate = function(itemImages) {

	Promise.all([updateItemImageModel({
		'image': 'a',
		'id': 38
	}), updateItemImageModel({
		'image': 'b',
		'id': 39
	})]).then(function(result) {
		console.log(result);
	})
}

exports.updateUserLogin = function(id, longitude, latitude) {
	UserLogin.update({
		'longitude': longitude,
		'latitude': latitude,
	}, {
		'where': {
			'id': id
		}
	}).then(function(affected_numbers, result1) {
		console.log(affected_numbers);
		console.log(result1);
	});
}


exports.insertRequestBeSeller = function(jsonObject, callback) {
	ShopModel.findOrCreate({
		'defaults': {
			'name': jsonObject['shop_name'],
			'uid': jsonObject['uid'],
			'beg': jsonObject['beg'],
			'end': jsonObject['end'],
			'days': jsonObject['end'],
			'area_code': jsonObject['area_code'],
			'city_no': jsonObject['city_no'],
			'category_code1': jsonObject['category_code1'],
			'category_code2': jsonObject['category_code2'],
			'category_code3': jsonObject['category_code3'],
			'address': jsonObject['address'],
			'telephone': jsonObject['telephone'],
			'state': 1,
		},
		'where': {
			'Id': null,
		}
	}).then(function(Instance, created) {
		let dbRow = Instance[0]['dataValues'];
		callback(null, dbRow);
	});
}

exports.saveSellerInfo = function(jsonObject, callback) {

	var value = {
		'name': jsonObject['shop_name'],
		'city_no': jsonObject['city_no'],
		'area_code': jsonObject['area_code'],
		'category_code1': jsonObject['category_code1'],
		'category_code2': jsonObject['category_code2'],
		'category_code3': jsonObject['category_code3'],
		'beg': jsonObject['beg'],
		'end': jsonObject['end'],
		'days': jsonObject['days'],
		'address': jsonObject['address'],
		'telephone': jsonObject['telephone'],
		'business': jsonObject['business'],
		'distribution': jsonObject['distribution'],
		'fix_telephone': jsonObject['fix_telephone'],
		'qq': jsonObject['qq'],
		'wx': jsonObject['wx'],
		'email': jsonObject['email'],
		'longitude': jsonObject['longitude'],
		'latitude': jsonObject['latitude'],
	};
	if ('qualification' in jsonObject) {
		value['qualification'] = jsonObject['qualification'];
	}
	let images = ['image1', 'image2', 'image3', 'image4'];
	for (var key in images) {
		let image_key = images[key];
		if (image_key in jsonObject) {
			value[image_key] = jsonObject[image_key];
		}
	}


	ShopModel.update(value, {
		'where': {
			'Id': jsonObject['id']
		}
	}).then(function(affected_numbers, result1) {
		callback(null);
	}, function(err) {

		callback(err || "error");
	});
}

exports.insertClaimInfo = function(jsonObject, callback) {
	ClaimModel.create(jsonObject,{}).then(function(Instance, created) {
		let dbRow = Instance[0]['dataValues'];
		callback(null, dbRow);
	}).catch((error)=>{
		callback(error);
	});
}

exports.uploadShopBigImage = function(shop_id, image, callback) {
	let jsonObject = {
		'big_image': image,
	};
	ShopModel.update(jsonObject, {
		'where': {
			'id': shop_id,
		}
	}).then((affected_numbers, result) => {
		callback(null);
	}).catch((error) => {
		callback(error);
	});
}

function updateManyItemImage(item_image) {
	return new Promise(function(resolve, reject) {
		console.log('item_image', item_image);
		ItemImageModel.upsert(item_image, {
			'where': {
				'item_id': item_image['item_id'],
				'image_type': item_image['image_type'],
				'index': item_image['index'],
			}
		}).then(function(affectedCount, affectedRows) {
			resolve(affectedCount);
		})
	});
}

function updateManyItemProperty(item_property) {
	return new Promise(function(resolve, reject) {
		ItemPropertyModel.upsert(item_property, {
			'where': {
				'item_id': item_property['item_id'],
				'index': item_property['index'],
			}
		}).then(function(affectedCount, affectedRows) {
			resolve(affectedCount);
		});
	});
}

exports.saveShopItem = function(jsonItem, jsonImages, jsonPropertys, callback) {
	Promise.resolve(true)
		.then(function() {
			return new Promise(function(resolve, reject) {
				ItemModel.update(jsonItem, {
					'where': {
						'id': jsonItem['id'],
					}
				}).then(function(affectedCount) {
					console.log(affectedCount);
					if (affectedCount[0] == 1) {
						resolve();
					} else {
						reject();
					}
				});
			});
		})
		.then(function() {
			let array_Promise = [];
			jsonImages.forEach(function(image) {
				array_Promise.push(updateManyItemImage(image));

			});

			return Promise.all(array_Promise);
		})
		.then(function() {

			let array_property_Promise = [];
			jsonPropertys.forEach(function(property) {
				array_property_Promise.push(updateManyItemProperty(property));
			});

			return Promise.all(array_property_Promise);

		}).then(function() {

			callback(null);
		});
}

exports.addShopItem = function(jsonItem, jsonImages, jsonPropertys, callback) {
	ItemModel.findOrCreate({
		'defaults': jsonItem,
		'where': {
			'id': null,
		}
	}).then(function(dbResult) {

		if (dbResult[1]) {
			let dbRow = dbResult[0]['dataValues'];
			let id = Number(dbRow['id']);
			for (var key in jsonImages) {
				jsonImages[key]['item_id'] = id;
			}

			ItemImageModel.bulkCreate(jsonImages).then(function() {
				for (var key in jsonPropertys) {
					jsonPropertys[key]['item_id'] = id;
				}
				ItemPropertyModel.bulkCreate(jsonPropertys).then(function() {
					callback(null, id);
				});
			});
			return;
		} else {
			callback("create failed");
		}

	});
}

exports.playerAttentionShop = function(jsonAttention, is_attention, callback) {
	if (is_attention) {
		UserAttentionModel.upsert(jsonAttention)
			.then(function(created) {
				callback(null, created);
			});
	} else {
		UserAttentionModel.destroy({
			'where': jsonAttention
		}).then(function(num) {
			callback(null, num);
		});
	}
}

exports.offShelveShopItem = function(items, state, callback) {
	let all_promise = [];

	items.forEach(function(item_id) {
		let promise = new Promise(function(resolve, reject) {
			ItemModel.update({
				'state': state
			}, {
				'where': {
					'id': item_id
				}
			}).then(function(affectedRows) {
				resolve(item_id);
			});
		})
		all_promise.push(promise);
	});

	Promise.all(all_promise).then(function(results) {
		//console.log('INFO','results:',results);
		callback(null, results);
	}, function() {
		callback('error');
	});
}

exports.closeShop = function(shop_id, callback) {


	let delete_shop_from_shop_info = new Promise((resolve, reject) => {
		ShopModel.destroy({
			'where': {
				'Id': shop_id
			}
		}).then((count) => {
			resolve(true);
		});
	});
	let delete_shop_from_shop_attention = new Promise((resolve, reject) => {
		UserAttentionModel.destroy({
			'where': {
				'shop_id': shop_id
			}
		}).then((count) => {
			resolve(true);
		});
	});
	let delete_item_from_shop = new Promise((resolve, reject) => {
		ItemModel.destroy({
			'where': {
				'shop_id': shop_id
			}
		}).then((count) => {
			resolve(true);
		});
	});

	let p = Promise.resolve(true);
	p.then(delete_shop_from_shop_info).then(delete_shop_from_shop_attention).then(
		() => {
			callback(null);
		}, () => {
			callback(true);
		});
}

exports.removeShopItem = function(item_id, callback) {
	let delete_item_from_item_table = new Promise((resolve, reject) => {
		ItemModel.destroy({
			'where': {
				'id': item_id
			}
		}).then((count) => {
			resolve(count);
		})
	});
	let delete_item_from_item_image = new Promise((resolve, reject) => {
		ItemImageModel.destroy({
			'where': {
				'id': item_id
			}
		}).then((count) => {
			resolve(count);
		})
	});
	let delete_item_from_item_property = new Promise((resolve, reject) => {
		ItemPropertyModel.destroy({
			'where': {
				'id': item_id
			}
		}).then((count) => {
			resolve(count);
		})
	});

	Promise.all([
			delete_item_from_item_table,
			delete_item_from_item_image,
			delete_item_from_item_property
		])
		.then((remove_count) => {
			console.log(remove_count)
			callback(null, remove_count);
		});
}

exports.registerPlayer = function(json_register, callback) {
	new Promise((resolve, reject) => {
		UserLogin.findOrCreate({
			'defaults': {
				'Account': json_register['telephone'],
				'Password': json_register['password'],
				'longitude': json_register['longitude'],
				'latitude': json_register['latitude'],
			},
			'where': {
				'Id': null,
			}
		}).then((Instance, created) => {
			let dbRow = Instance[0]['dataValues'];
			resolve(dbRow);
		});
	}).then((login_info) => {
		console.log("db_seq:", login_info)
		UserModel.findOrCreate({
			'defaults': {
				'id': login_info['Id'],
				'name': '用户' + login_info['Id'],
				'state': 0,
			},
			'where': {
				'id': login_info['Id'],
			}
		}).then((Instance, created) => {
			let user_info = Instance[0]['dataValues'];
			callback(login_info, user_info);
		});
	});
}

exports.saveUserInfo = function(uid, json_userinfo, callback) {
	console.log("db_seq: uid:", uid, "json_userinfo:", json_userinfo);
	UserModel.update(
			json_userinfo, {
				"where": {
					'id': uid
				}
			})
		.then((affectedCount, results) => {
			callback(null);
		});
	return;
}

exports.addFavoriteItem = function(uid, item_id, callback) {
	FavoriteMode.create({
		'uid': uid,
		'item_id': item_id,
	}).then((Instance) => {
		//console.log(Instance);
		callback(null, Instance['dataValues']);
	}).catch((error) => {
		//console.log(error);
		callback(error);
	})
}

exports.removeFavoriteItem = function(uid, item_id, callback) {
	FavoriteMode.destroy({
		'where': {
			'uid': uid,
			'item_id': item_id,
		}
	}).then(() => {
		callback(null);
	}).catch((error) => {
		callback(error);
	})
}

exports.updateVerifyCodeInfo = function(db_row, callback) {
	VerifyCodeInfo.upsert(db_row, {
		'where': {
			'telephone': db_row['telephone'],
		}
	}).then(() => {
		callback(null);
	}).catch((error) => {
		callback(error);
	});
}
exports.changePassword = function(telephone, password, callback) {
	UserLogin.update({
		'Password': password,
	}, {
		'where': {
			'Account': telephone,
		}
	}).then((affected_numbers, result1) => {
		callback(null);
	}).catch((error) => {
		callback(error);
	})

}

exports.addGroupMsg = function(shop_id, msg, images, callback) {
	GroupMsgModel.create({
		'shop_id': shop_id,
		'msg': msg,
		'image1': images['image_0'],
		'image2': images['image_1'],
		'image3': images['image_2'],
		'image4': images['image_3'],
		'image5': images['image_4'],
		'image6': images['image_5'],
		'image7': images['image_6'],
		'image8': images['image_7'],
		'image9': images['image_8'],
	}, {}).then((Model) => {
		callback(null, {
			'id': Model.id,
			'shop_id': Model.shop_id,
			'msg': Model.msg,
			'image1': Model.image1,
			'image2': Model.image2,
			'image3': Model.image3,
			'image4': Model.image4,
			'image5': Model.image5,
			'image6': Model.image6,
			'image7': Model.image7,
			'image8': Model.image8,
			'image9': Model.image9,
			'createdAt': Model.createdAt,
		})
	}).catch((error) => {
		callback(error);
	});
};


exports.syncGroupMsgByShopId = function(shop_id, callback) {
	GroupMsgModel.findAll({
		'where': {
			'shop_id': shop_id,
		},
		'order': [
			['createdAt', 'ASC']
		],
	}).then((all_rows, b) => {
		callback(all_rows);
	}).catch(() => {
		callback([]);
	})
}

exports.clearGroupMsg = function(shop_id, callback) {
	GroupMsgModel.destroy({
		'where': {
			'shop_id': shop_id,
		}
	}).then(() => {
		callback(null);
	}).catch((error) => {
		callback(error);
	});
}
exports.removeGroupMsg = function(shop_id, msg_id, callback) {
	GroupMsgModel.destroy({
		'where': {
			'shop_id': shop_id,
			'id': msg_id,
		}
	}).then(() => {
		callback(null);
	}).catch((error) => {
		callback(error);
	});
}

exports.getAllGroupChat = function(callback) {
	GroupChatModel.findAll({
		'order': [
			['shop_id', 'ASC'],
			['createdAt', 'ASC']
		],

	}).then((db_list) => {
		let list = [];
		//console.log("db_list",db_list);

		for (let db_row_index in db_list) {
			let db_row = db_list[db_row_index]['dataValues'];

			list.push({
				'id': db_row['id'],
				'uid': db_row['uid'],
				'shop_id': db_row['shop_id'],
				'msg': db_row['msg'],
				'createdAt': db_row['createdAt'],
			});
		}
		callback(null, list);
	}).catch((error) => {
		callback(error);
	})
}

exports.addGroupChat = function(uid, shop_id, msg, callback) {
	GroupChatModel.create({
		'uid': uid,
		'shop_id': shop_id,
		'msg': msg,
	}, {}).then((db_row) => {
		callback(null, {
			'id': db_row['id'],
			'uid': db_row['uid'],
			'shop_id': db_row['shop_id'],
			'msg': db_row['msg'],
			'createdAt': db_row['createdAt'],
		});
	}).catch((error) => {
		console.log(error);
		callback(error);
	})
}

exports.updateLastLoginInfo = function(uid,last_login_time,callback){
	UserLogin.update({
		'last_login_time' : last_login_time,
	},{
		'where' : {
			'Id' : uid,
		}
	}).then(()=>{
		callback(null);
	}).catch((error)=>{
		callback(error);
	})
}

exports.upsertShopActivity = function(json_row,callback){
	
	ShopActivityModel.upsert(json_row,{
	}).then((created)=>{
		callback(null);
	}).catch((error)=>{
		callback(error);
	});
}

exports.loadAllShopActivity = function(callback){
	ShopActivityModel.findAll({
	}).then((all_rows)=>{
		callback(null,all_rows);
	}).catch((error)=>{
		callback(error);
	})
}

exports.getActivityByShopId = function(shop_id,callback){
	
	ShopActivityModel.findAll({
		'where' : {
			'shop_id' : shop_id,
		}
	}).then((all_rows)=>{
		
		if(all_rows.length == 1){
			callback(null,all_rows[0]['dataValues']);
		}else{
			if(all_rows.length == 0){
				callback(null,null);
			}else{
				callback('error');
			}
		}
		
	}).catch((error)=>{
		callback(error);
	})
}

exports.findShopQRImage = function(shop_id,callback){
	ShopImageModel.findAll({
		'where' : {
			'shop_id' : shop_id,
			'image_type' : 1,
		},
		'order': [
			['image_index', 'ASC']
		],
	}).then((all_rows)=>{
		let result = [];
		for(let row of all_rows){
			result.push({
				'image_index' : row['dataValues']['image_index'],
				'image' : row['dataValues']['image'],
			});
		}
		callback(null,result);

	}).catch((error)=>{
		callback(error,null);
	});
}

exports.updateShopImage = function(shop_id,image_type,image_index,image,callback){
	ShopImageModel.upsert({
		'shop_id' : shop_id,
		'image_type' : image_type,
		'image_index' : image_index,
		'image' : image,
	}).then((created)=>{
		callback(null);
	}).catch((error)=>{
		callback(error);
	});
}

exports.fetchAllMessage = function(last_time,callback){
	UserMessageModel.findAll({
		'where' : {
			$or : [
				{
					'createdAt' : {gt : last_time}
				},{
					'updatedAt' : {gt : last_time}
				},{
					'deletedAt' : {gt : last_time}
				}
			]
		},
		'order' : [['createdAt', 'DESC']],
	}).then((all_message_list)=>{
		let result = [];
		if(all_message_list != null){
			for(let message of all_message_list){
				result.push(message.toJSON());
			}
		}
		//console.log(result);
		callback(result);
	}).catch((error)=>{
		console.log(error);
		callback(null);
	})
}