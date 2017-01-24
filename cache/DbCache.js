var util = require('util');
var logger = require('../logger').logger();
var AdBean = require("../bean/AdBean");
var CategoryMenuBean = require("../bean/CategoryMenuBean");
g_db_cache = {
	'area_menu' : {},
	'city_info' : {},
	'category_menu' : [],
	'ad_image' : {},
};

/*
* ad_image: 
	key:position:
	value :{
		dirty:
		result:[]
	}
*/
g_db_query_cache = {
	'ad_image' : {}
};

exports.InitFromDb = function(db_list_result){

	var list_area_menu = db_list_result[0];
	for(var i in list_area_menu){
		var area = list_area_menu[i];
		var city = Number(area['city']);
		var code = Number(area['code']);

		if(g_db_cache['area_menu'][city] == null){
			g_db_cache['area_menu'][city] = [];
		}
		
		if(code > 0){
			g_db_cache['area_menu'][city].push({
				'name' : area['name'],
				'code' : code,
				'city' : city
			});
		}
	}

	var list_category_code = db_list_result[1];
	//logger.log("DB_CACHE","category_code:" + util.inspect(list_category_code));
	for(var i in list_category_code){
		var class_id = parseInt(list_category_code[i]['class']);
		var name = list_category_code[i]['name'];
		var code = parseInt(list_category_code[i]['code']);
		g_db_cache['category_menu'].push(new CategoryMenuBean(class_id,name,code));
	}
	//logger.log("DB_CACHE","[Init][init shop_ad] db:" + util.inspect(db_list_result[2]));
	var list_all_ad_info = db_list_result[2];
	for(var key in list_all_ad_info){
		var ad_position = Number(list_all_ad_info[key]['position']);
		var bean = new AdBean(list_all_ad_info[key]);

		if(ad_position in g_db_cache['ad_image']){
			g_db_cache['ad_image'][ad_position].push(bean);
		}else{
			g_db_cache['ad_image'][ad_position] = [bean];
		}
	}
	logger.log("DB_CACHE","[Init][ad_image]:" + util.inspect(g_db_cache['ad_image'],{depth:null}));
}

exports.getAreaMenu = function(){
	var list = [];
	for(var key in g_db_cache['area_menu']){

		for(var i in g_db_cache['area_menu'][key]){
			list.push(g_db_cache['area_menu'][key][i]);
		}
	}
	return{
		'list':list
	}
}

exports.getShopCategory = function(){

	var list = [];
	for(var i in g_db_cache['category_menu']){
		list.push(g_db_cache['category_menu'][i].getJsonValue());
	}
	return list;

}

exports.getShopArea = function(){
	return {
		'list':[{
			'province' : 9,
			'city' : 167,
			'name' : '测试代码区',
			'code' : 167001
		}]
	};
}

exports.getShopAd = function(position){
	if(position in g_db_cache['ad_image']){
		if(position in g_db_query_cache['ad_image'] && g_db_query_cache['ad_image'][position]['dirty'] == false){
			return g_db_query_cache['ad_image'][position]['result'];
		}
		
		if(position in g_db_query_cache['ad_image']){
			g_db_query_cache['ad_image'][position]['result'].splice(0,g_db_query_cache['ad_image'][position]['result'].length);
		}else{
			g_db_query_cache['ad_image'][position] = {
				'dirty' : false,
				'result' : []
			};
		}
		for(var key in g_db_cache['ad_image'][position]){
			g_db_query_cache['ad_image'][position]['result'].push(g_db_cache['ad_image'][position][key].getJsonValue());
		}
		g_db_query_cache['ad_image'][position]['result'].sort(function(a,b){
			return a['index'] > b['index'];
		});
		g_db_query_cache['ad_image'][position]['dirty'] = false;

		return g_db_query_cache['ad_image'][position]['result'];
	}
	return [];
}