'use strict';
var _db = require("../db_sequelize");
var logger = require("../logger.js").logger();

require("./Attentions.js");
require("./login.js");
require("./online.js");
require("./register.js");
require("./shop.js");
require('./AttentionBoard.js');
require('./favorite.js');
require('./FindPassword.js');
require('./VerifyCodeService.js');
require('./ShopActivityService.js');

let groupChatService = require('./groupChatService.js');

function _loadGroupChat() {
	_db.getAllGroupChat((error,list) => {
		if(error){
			logger.log("ERROR","_loadGroupChat error:",error);
		}else{
			for(let db_row of list){
				groupChatService.addFromDb(db_row);
			}
			logger.log("INFO",'_loadGroupChat add count',list.length);
		}
	});
}

_loadGroupChat();