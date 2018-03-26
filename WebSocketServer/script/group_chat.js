'use strict';
//group_chat

var PlayerManager = require("../../playerList.js");
const Joi = require('joi');

let LoginModule = require("../../Logic/login.js");
let OnlineModule = require("../../Logic/online.js");
let UserModule = require("../../playerList.js");
let ShopService = require("../../Logic/shop.js");
let GroupChatService = require("../../Logic/groupChatService.js");
let AttentionService = require("../../Logic/Attentions.js");
let ErrorCode = require("../../error.js");
let _db = require('../../db_sequelize');
var logger = require('../../logger').logger();
function vaildJSON(jsonLogin) {
	const schema = Joi.object().keys({
		'shop_id': Joi.number().required(),
		'msg': Joi.string().required(),
	});
	const result = Joi.validate(jsonLogin, schema);
	if (result.error != null) {
		return false;
	}
	return true;
}


module.exports = function(server, socket, json) {

	if (vaildJSON(json)) {
		let uid = socket.uid;

		if(uid === undefined){
			uid = OnlineModule.findUID(socket.nid)
			logger.log("INFO", `${uid} is find`);
		}

		if (uid <= 0) {
			server.reply(socket, "group_chat_rep", {
				'error': ErrorCode.USER_NO_LOGIN,
			});
			return;
		}
		let shop_id = Number(json['shop_id']);
		let msg = json['msg'];

		let check_can_send = AttentionService.isAttentionThisShop(uid, shop_id);
		if (!check_can_send) {
			let own_shop_id = ShopService.getOwnShopId(uid);
			check_can_send = (own_shop_id == shop_id);
		}

		if (check_can_send) {

			_db.addGroupChat(uid, shop_id, msg, (error, db_row) => {
				if (error) {
					server.reply(socket, "group_chat_rep", {
						'error': ErrorCode.SQL_ERROR,
					});
				} else {
					GroupChatService.addFromApp(db_row);
				}
			});

			return;
		} else {
			server.reply(socket, "group_chat_rep", {
				'error': ErrorCode.USER_NO_ATTENTION,
			});
			return;

		}



	} else {
		let response = {};
		response['error'] = ErrorCode.FIELD_PARAM_ERROR;
		server.reply(socket, "login", response);
	}
	return;

}