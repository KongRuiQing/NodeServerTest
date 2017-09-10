'use strict';

var util = require('util');
var ShopCache = require("../../cache/shopCache");
var PlayerCache = require("../../playerList.js");
var DbCache = require("../../cache/DbCache");
var logger = require("../../logger").logger();

var moment = require('moment');
var down_file_name = "";
var down_file_version = "";
var WebSocketServer = require("../../WebSocketServer");
var AttentionService = require("../../Logic/Attentions.js");
var ShopService = require("../../Logic/shop.js");
const assert = require('assert');
var AttentionBoardService = require("../../Logic/AttentionBoard.js");
let FavoriteService = require("../../Logic/favorite.js");
let ErrorCode = require("../../error.js");
let GroupMsgService = require("../../Logic/groupMsgService.js");
let ShopActivityService = require("../../Logic/ShopActivityService.js");
var SpreadItemService = require("../../Logic/SpreadItemService.js");
var _db = require("../../db_sequelize");

exports.getShopQRCodeImage = function(headers, query, callback) {
	let shop_id = 0;
	if ("shop_id" in query) {
		shop_id = Number(query['shop_id']);
	}


	if (shop_id == 0) {
		let uid = Number(headers['uid']);
		shop_id = ShopService.getOwnShopId(uid);
	}
	if (shop_id == 0) {
		callback(0, {
			'error': 2,
			'error_msg': "没有找到对应的商铺二维码信息",
		});
		return;
	}

	_db.findShopQRImage(shop_id,(error,result)=>{
		if(error){
			callback(0,{
				'error' : 2,
				'error_msg' : '数据库失败',
			});
			return;
		}else{
			callback(0,{
				'list' : result,
			});
		}
	});


}