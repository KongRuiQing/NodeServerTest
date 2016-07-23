var db = require('../mysqlproxy');

exports.getShopList = function(data,target,callback){

	var cb = function(success,result){
		var ret = {
			page:data['page'],
			shop:[],
			errcode:1
		};
		if(success)
		{
			for(var i in result){
				var row = result[i];
				ret.shop.push(row);
			}
			ret.errcode = 0;
		}

		callback(target,ret,"get_shop_list");
	};
	if(!("longitude" in data)){
		data['longitude'] = target.GetLongitude();
	}
	if(!("latitude" in data)){
		data['latitude'] = target.GetLatitude();
	}

	db.GetShopList(data['page'],10,data['longitude'],data['latitude'],cb);
}

exports.attentionShop = function(query,player,callback){
	var shop_id = query['shop_id'] || 0;
	var player_id = player.GetPlayerId();
	db.AttentionShop(player_id,shop_id,function(success,db_result){
		
		var ret = {};
		if(success){
			ret['errcode'] = 0;
			
		}else{
			ret['errcode'] = 1;
		}
		callback(player,ret,"attentionShop")
		
	});
}

