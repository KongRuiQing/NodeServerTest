'use strict';

var PlayerManager = require("../../playerList.js");
const Joi = require('joi');

let LoginModule = require("../../Logic/login.js");
let OnlineModule = require("../../Logic/online.js");
let UserModule = require("../../playerList.js");

function vaildLogin(jsonLogin){
	const schema = Joi.object().keys({
		'account': Joi.string().required(),
		'password': Joi.string().required(),
		'nid' : Joi.string().required(),
	});
	const result = Joi.validate(jsonLogin, schema);
	if(result.error != null){
		return false;
	}
	return true;
}


module.exports = function(server,socket,jsonLogin){

	if(vaildLogin(jsonLogin)){
		let login_result = LoginModule.checkLogin(jsonLogin['account'],jsonLogin['password']);

		if(login_result != null){
			let error = 0;
			if('error' in login_result){
				error = login_result['error'];
			}
			let response = {};
			if(error == 0){
				// kick other
				let login_info = login_result['login_info'];
				let login_socket_id = OnlineModule.isLogin(login_info['uid']);
				if(login_socket_id != null && login_socket_id != ""){
					if(jsonLogin['nid'] != login_socket_id){
						server.sendMessage(login_socket_id,'kickoff',{
							'reason' : 1002, 
						});
					}
					
				}
				// end
				let guid = OnlineModule.registerLogin(login_info['uid'],jsonLogin['nid']);
				server.register(jsonLogin['nid'],socket);
				let user_info = UserModule.getInstance().getUserInfo(login_info['uid']);

				response['error'] = 0;
				response['user_info'] = user_info;
				response['guid'] = guid;
				
			}else{
				response['error'] = error;
			}
			
			server.reply(socket,"login",response);
		}else{
			server.reply(socket,"login",{
				'error' : 1001,
			})
		}
	}else{
		let response = {};
		response['error'] = 0;
		server.reply(socket,"login",response);
	}
	
}