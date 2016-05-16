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

