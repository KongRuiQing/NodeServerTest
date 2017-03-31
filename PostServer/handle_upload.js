'use strict';

const fs = require('fs');
var util = require('util');
var logger = require('../logger').logger();
var db = require("../mysqlproxy");
var PlayerProxy = require("../playerList.js");
var ShopProxy = require("../cache/shopCache.js");
var path=require('path');
var moment = require('moment');

let BASE_SHOP_IMAGE = "../Image";
let db_sequelize = require("../db_sequelize");

let HeadInstance = require("../HttpHeadInstance");
var HelpUtil = require("./post_helputil.js");

exports.uploadImage = function(header,fields,files,callback){

	let file_param = {
		'image' : 'shop/big/image',
	}
	let param = {};
	HelpUtil.getAllUploadFile(files,file_param,param);
	if(!('image' in param)){
		callback(true,{
			'error' : 1,
			'error_msg' : '没有指定image',
		});
		return;
	}
	if(!('type' in fields)){
		callback(true,{
			'error' : 1,
			'error_msg' : '没有指定type',
		});
		return;
	}

	let type = Number(files['type']);
	if(isNaN(type)){
		callback(true,{
			'error' : 1,
			'error_msg' : 'type值无效',
		});
		return;
	}
	let uid = headerp['uid'];
	if(uid == 0){
		callback(true,{
			'error' : 1001,
			'error_msg' : '没有登陆',
		});
		return;
	}
	if(type == 1){
		let shop_id = PlayerProxy.getInstance().getMyShopId(uid);
		db_sequelize.uploadShopBigImage(shop_id,param['image'],function(error){
			if(error){
				callback(true,{
					'error' : 2,
					'error_msg' : error, 
				});
				return;
			}
			callback(true,{
				'error' : 0,
				'image' : param['image'],
			});
		});
	}
	
}