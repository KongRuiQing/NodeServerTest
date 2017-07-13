'use strict';
const fs = require('fs');
var util = require('util');
var logger = require('../logger').logger();
var db = require("../mysqlproxy");
var PlayerProxy = require("../playerList.js");
var ShopProxy = require("../cache/shopCache.js");
var path = require('path');
var moment = require('moment');
let ErrorCode = require("../error.js");
let _db = require("../db_sequelize");
let Ws = require("../WebSocketServer");
let LoginModule = require("../Logic/login.js");
let RegisterService = require("../Logic/register.js");
let VerifyCodeService = require("../Logic/VerifyCodeService.js");
var OnlineService = require("../Logic/online.js");
const Joi = require('joi');
let AttentionService = require("../Logic/Attentions.js");
let FavoriteService = require("../Logic/favorite.js");
var AppConfig = require('config');
var GroupMsgService = require("../Logic/groupMsgService.js");
var GroupChatService = require("../Logic/groupChatService.js");
var help = require("./post_helputil.js");
var ShopService = require("../Logic/shop.js")
exports.addGroupMsg = function(header, fields, files, cb) {
	let uid = Number(header['uid']);
	if (uid <= 0) {
		cb(true, {
			'error': ErrorCode.USER_NO_LOGIN,
		});
		return;
	}
	let shop_id = ShopService.getOwnShopId(uid);
	if (shop_id <= 0) {
		cb(true, {
			'error': ErrorCode.USER_NO_SHOP,
		});
		return;
	}
	let uploadFileKey = {
		'image_0': 'shop/group/',
		'image_1': 'shop/group/',
		'image_2': 'shop/group/',
		'image_3': 'shop/group/',
		'image_4': 'shop/group/',
		'image_5': 'shop/group/',
		'image_6': 'shop/group/',
		'image_7': 'shop/group/',
		'image_8': 'shop/group/',
	};
	let images = {};
	help.getAllUploadFile(files,uploadFileKey,images);

	//upload_file_to_json(files, uploadFileKey, images);
	let msg = fields['msg'];
	_db.addGroupMsg(shop_id, msg, images, (error, db_row) => {
		if (error) {
			logger.log("ERROR", "_db.addGroupMsg Error:", error);
			cb(true, {
				'error': ErrorCode.SQL_ERROR,
			});
			return;
		}

		GroupMsgService.addFromDb(db_row);

		cb(true, {
			'error': 0,
			'bean': {
				'id': Number(db_row['id']),
				'msg': msg,
				'shop_id' : shop_id,
				'images': [db_row['image1'], db_row['image2'], db_row['image3'], db_row['image4'], db_row['image5'], db_row['image6'], db_row['image7'], db_row['image8'], db_row['image9']],
				'time': moment(db_row['createdAt']).format("YYYY.MM.DD HH:mm"),
			}
		});
	});
}

exports.clearGroupMsg = function(header, fields, files, cb) {
	let uid = Number(header['uid']);
	if (uid <= 0) {
		cb(true, {
			'error': ErrorCode.USER_NO_LOGIN,
		});
		return;
	}
	let shop_id = ShopService.getOwnShopId(uid);
	if (shop_id <= 0) {
		cb(true, {
			'error': ErrorCode.USER_NO_SHOP,
		});
		return;
	}

	let msg_id = Number(fields['msg_id']);

	if (msg_id == 0) {
		_db.clearGroupMsg(shop_id, (error) => {
			if (error) {
				logger.log("ERROR", 'clearGroupMsg error:', error);
				cb(true, {
					'error': ErrorCode.SQL_ERROR,
				});
				return;
			}

			GroupMsgService.clearGroupMsg(shop_id);
			cb(true, {
				'error': 0,
			})
		});
	} else {
		_db.removeGroupMsg(shop_id, msg_id, (error) => {
			if (error) {
				logger.log("ERROR", 'removeGroupMsg error:', error);

				cb(true, {
					'error': ErrorCode.SQL_ERROR,
				});
				return;
			}
			GroupMsgService.removeGroupMsg(shop_id, msg_id);
			cb(true, {
				'error': 0,
			});

		});
	}
}

exports.addGroupChat = function(header, fields, files, cb){
	let uid = header['uid'];
	let shop_id = Number(fields['shop_id']);
	let msg = fields['msg'];

	_db.addGroupChat(uid,shop_id,msg,(error,db_row)=>{
		if(error){
			logger.log("ERROR",'addGroupChat error:',error);
			cb(true,{
				'error' : ErrorCode.SQL_ERROR,
			});
		}else{
			GroupChatService.addFromApp(db_row);

			cb(true,{
				'error' : 0,
				'bean' : {
					'uid' : uid,
					'shop_id' : shop_id,
					'msg' : msg,
					'createdAt' : db_row['createdAt'],
				}
			});
			
		}
	});
}