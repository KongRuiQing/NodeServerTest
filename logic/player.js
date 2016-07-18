var db = require('../mysqlproxy');

exports.player_detail = function(query,player,callback){
	callback(player,{},"player_detail");
}


