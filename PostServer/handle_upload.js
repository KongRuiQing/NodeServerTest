'use strict';

const fs = require('fs');
var util = require('util');
var logger = require('../logger').logger();
var db = require("../mysqlproxy");
var PlayerProxy = require("../playerList.js");
var ShopProxy = require("../cache/shopCache.js");
var path = require('path');
var moment = require('moment');

let BASE_SHOP_IMAGE = "../Image";
let db_sequelize = require("../db_sequelize");

let HeadInstance = require("../HttpHeadInstance");
var HelpUtil = require("./post_helputil.js");
var ShopService = require("../Logic/shop.js");

exports.uploadImage = function(header, fields, files, callback) {

	let file_param = {
		'image': 'shop/big_image',
	}
	let param = {};
	HelpUtil.getAllUploadFile(files, file_param, param);
	if (!('image' in param)) {
		callback(true, {
			'error': 1,
			'error_msg': '没有指定image',
		});
		return;
	}
	if (!('type' in fields)) {
		callback(true, {
			'error': 1,
			'error_msg': '没有指定type',
		});
		return;
	}

	let type = Number(fields['type']);

	if (isNaN(type)) {
		callback(true, {
			'error': 1,
			'error_msg': 'type值无效',
		});
		return;
	}
	let uid = Number(header['uid']);
	if (uid == 0) {
		callback(true, {
			'error': 1001,
			'error_msg': '没有登陆',
		});
		return;
	}
	if (type == 4) {
		let shop_id = ShopService.getOwnShopId(uid);
		if (shop_id == 0) {
			callback(true, {
				'error': 3,
				'error_msg': error,
			});
			return;
		}
		db_sequelize.uploadShopBigImage(shop_id, param['image'], (error) => {
			if (error) {
				callback(true, {
					'error': 2,
					'error_msg': error,
				});
				return;
			}
			callback(true, {
				'error': 0,
				'image': param['image'],
			});
		});
	} else {
		callback(true, {
			'error': 4,
			'image': param['image'],
		});
	}

}