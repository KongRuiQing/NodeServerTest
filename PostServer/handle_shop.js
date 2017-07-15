'use strict';
//handle_shop.js
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
var ShopService = require("../Logic/shop.js");

exports.claimShop = function(header, fields, files, cb) {

	logger.log("HTTP_HANDLER", "[claimShop] params: " + util.inspect(fields));
	if (!('uid' in header)) {
		cb(true, {
			'error': 1001,
			'error_msg': '没有登录',
		});
		return;
	}
	let shop_id = Number(fields['shop_id']);

	let uid = Number(header['uid']);

	let claim_check_result = ShopService.checkCanClaim(uid, shop_id);

	if (claim_check_result == false) {
		cb(true, {
			'error': ErrorCode.CLAIM_ERROR,
			'error_msg': '用户或商铺不满足认领条件',
		});
		return;
	}


	let json_param = {
		'name': fields['name'],
		'telephone': fields['telephone'],
		'uid': Number.parseInt(header['uid']),
		'shop_id': Number.parseInt(fields['shop_id'])
	};

	_db.insertClaimInfo(json_param, function(err, db_row) {
		if(err){
			logger.log("ERROR","insertClaimInfo:",err);
			cb(true,{
				'error' : ErrorCode.SQL_ERROR,
			});
			return;
		}
		
		let uid = Number(db_row['uid']);
		let shop_id = Number(db_row['shop_id']);
		ShopService.addClaim(uid, shop_id);
		cb(true, {
			'claim_shop_id': shop_id,
		});
		HeadInstance.getInstance().emit('shop_claim', shop_id);
	});

}