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
	var attention = parseInt(query['attention']);
	var player_id = player.GetUserId();
	db.AttentionShop(player_id,shop_id,attention,function(success,db_result){
		var ret = {};
		if(success){
			ret['errcode'] = db_result['errcode'];
			
		}else{
			ret['errcode'] = 1;
		}
		ret['has_attention'] = parseInt(db_result['has_attention']);
		ret['attention_count'] = parseInt(db_result['attention_count']);
		callback(player,ret,"attentionShop")
		
	});
}

