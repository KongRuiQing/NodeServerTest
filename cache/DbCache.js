var util = require('util');
var logger = require('../logger').logger();

g_db_cache = {
	'area_menu' : {},
	'city_info' : {},
	'category_menu' : {}
};

exports.InitFromDb = function(db_list_result){

	var list_area_menu = db_list_result[0];
	for(var i in list_area_menu){
		var area = list_area_menu[i];
		if(g_db_cache['area_menu'][area['city']] == null){
			g_db_cache['area_menu'][area['city']] = [];
		}
		var area_code = parseInt(area['code']);
		if(area_code > 0){
			g_db_cache['area_menu'][area['city']].push({
				'name' : area['name'],
				'code' : area['code'],
				'city' : area['city']
			});
		}else{
			g_db_cache['city_info'][area['city']] = {
				'name' : area['name']
			};
		}
	}

	var list_category_code = db_list_result[1];
	//logger.log("DB_CACHE",util.inspect(list_category_code));

	for(var i in list_category_code){
		var class_id = parseInt(list_category_code[i]['class']);
		var name = list_category_code[i]['name'];
		var code = parseInt(list_category_code[i]['code']);
		if(code == 0){
			if(class_id in g_db_cache['category_menu']){
				g_db_cache['category_menu'][class_id]['name'] = name;
			}else{
				g_db_cache['category_menu'][class_id] = {
					'name' : name,
					'list' : []
				};
			}
		}else{
			if(class_id in g_db_cache['category_menu']){
				g_db_cache['category_menu'][class_id]['list'].push(
				{
					'name':name,
					'code' : code
				});
			}else{
				g_db_cache['category_menu'][class_id] = 
				{
					'name' : '',
					'list' : [
					{
						'name':name,
						'code' : code
					}
					]
				}
			}
		}
	}

	//logger.log("DB_CACHE",util.inspect(g_db_cache['category_menu']));

	
}

exports.getAreaMenu = function(city){
	if(g_db_cache['area_menu'][city] == null){
		return {};
	}
	if(g_db_cache['city_info'][city] == null){
		return {};
	}

	return {
		'list' : g_db_cache['area_menu'][city],
		'city' : {
			'name' : g_db_cache['city_info'][city]['name'],
			'code' : 0
		}
	};
}

exports.getShopCategory = function(){

	var list = [];
	for(var i in g_db_cache['category_menu']){
		list.push({
			'parent' : {'name':g_db_cache['category_menu'][i]['name'],'code' : i},
			'child' : g_db_cache['category_menu'][i]['list']
		});
	}
	return list;

}

exports.getShopCategoryClass = function(){
	var list = [];
	for(var i in g_db_cache['category_menu']){
		list.push({
			'name' : g_db_cache['category_menu'][i]['name'],
			'code' : i
		});
	}
	return list;
}

exports.getShopArea = function(){
	
}