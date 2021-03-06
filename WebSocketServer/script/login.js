'use strict';

var PlayerManager = require("../../playerList.js");
const Joi = require('joi');
let moment = require('moment');
let LoginModule = require("../../Logic/login.js");
let OnlineModule = require("../../Logic/online.js");
let UserModule = require("../../playerList.js");
let ShopService = require("../../Logic/shop.js");
let GroupChatService = require("../../Logic/groupChatService.js");
let AttentionService = require("../../Logic/Attentions.js");
let _db = require("../../db_sequelize");
function vaildLogin(jsonLogin) {
	const schema = Joi.object().keys({
		'account': Joi.string().required(),
		'password': Joi.string().required(),
		'nid': Joi.string().required(),
		'last_group_chat_time' : Joi.number().integer().required(),
	});
	const result = Joi.validate(jsonLogin, schema);
	if (result.error != null) {
		return false;
	}
	return true;
}



module.exports = function(server, socket, jsonLogin) {

	if (vaildLogin(jsonLogin)) {

		let login_result = LoginModule.checkLogin(jsonLogin['account'], jsonLogin['password']);

		if(jsonLogin['nid'] && socket.nid === undefined){
			socket.nid = jsonLogin['nid'];
		}
		if (login_result != null) {
			let error = 0;
			if ('error' in login_result) {
				error = Number(login_result['error']);
			}
			let response = {};
			if (error == 0) {
				// kick other
				let login_info = login_result['login_info'];
				
				let login_socket_id = OnlineModule.isLogin(login_info['uid']);
				if (login_socket_id != null && login_socket_id != "") {
					if (jsonLogin['nid'] != login_socket_id) {
						server.sendMessage(login_socket_id, 'kickoff', {
							'reason': 1002,
						});
					}
				}
				// end

				let guid = OnlineModule.registerLogin(login_info['uid'], jsonLogin['nid']);
				socket.nid = jsonLogin['nid'];
				server.register(socket);
				socket.uid = Number(login_info['uid']);
				
				let user_info = UserModule.getInstance().getUserInfo(login_info['uid']);
				
				user_info['shop_id'] = ShopService.getBindShopId(user_info['uid']);
				user_info['shop_state'] = ShopService.getShopState(user_info['shop_id']);

				user_info['claim'] = ShopService.getClaimShop(user_info['uid']);
				response['error'] = 0;
				response['user_info'] = user_info;
				response['guid'] = guid;
				let last_group_chat_time = moment(jsonLogin['last_group_chat_time'] * 1000);
				response['group_chat'] = GroupChatService.getGroupChatLogin(last_group_chat_time,AttentionService.getAttentionShops(user_info['uid']));

				_db.updateLastLoginInfo(user_info['uid'],moment().unix(),(error)=>{
					if(error){
						console.log("updateLastLoginInfo:",error);
					}
				});
			} else {
				response['error'] = error;
			}

			server.reply(socket, "login", response);
		} else {
			server.reply(socket, "login", {
				'error': 1001,
			})
		}
	} else {
		let response = {};
		response['error'] = 0;
		server.reply(socket, "login", response);
	}

}