'use strict';
var util = require('util');
var logger = require('../logger').logger();
var AdBean = require("../bean/AdBean");
var AreaBean = require("../bean/AreaBean");
var CategoryMenuBean = require("../bean/CategoryMenuBean");
var moment = require('moment');



function DbCacheManager(){
	this.area_menu = {};
	this.city_info = {};
	this.category_menu = [];
	this.ad_image = {};
}


var g_db_cache = new DbCacheManager();

exports.getInstance = function(){
	return g_db_cache;
}

var g_db_query_cache = {
	'ad_image' : {}
};



DbCacheManager.prototype.InitFromDb = function(db_list_result){

	var list_area_menu = db_list_result[0];
	for(var i in list_area_menu){

		var area = list_area_menu[i];
		var city = Number(area['city']);
		var code = Number(area['code']);

		if(g_db_cache['area_menu'][city] == null){
			g_db_cache['area_menu'][city] = {
				'Last_Modified' : moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
				'list' : [],
			};
		}
		if(code > 0){
			let bean = new AreaBean();
			bean.initFromDbRow(area);
			g_db_cache['area_menu'][city]['list'].push(bean);
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
	//logger.log("DB_CACHE","[Init][ad_image]:" + util.inspect(g_db_cache['ad_image'],{depth:null}));
}



DbCacheManager.prototype.getAreaMenuFromCache = function(city){
	//logger.log("DB_CACHE","[DB_CACHE][DbCacheManager.getAreaMenu]:" + util.inspect(this.area_menu,{depth:null}));
	let list = [];
	if(city in this.area_menu){
		for(var i in this.area_menu[city]['list']){
			list.push(this.area_menu[city]['list'][i].getJsonValue());
		}
		return{
			'list':list,
			'Last_Modified' : this.area_menu[city]['Last_Modified'],
			'city' : city
		}
	}
	return {
		'list' : [],
		'Last_Modified':0,
		'city' : 0,
	};
	
	//logger.log("DB_CACHE","[DB_CACHE][DbCacheManager.getAreaMenu]:" + util.inspect(this.area_menu,{depth:null}));
	
}

DbCacheManager.prototype.getAreaMenu = function(Last_Modified,city){
	
	
	if(!(city in this.area_menu)){
		
		return {
			'list' : [],
		}
	};

	if(Last_Modified == null){
		
		return this.getAreaMenuFromCache(city);
	}else{
		var a = moment(this.area_menu[city]['Last_Modified']);
		var b = moment(Last_Modified);
		if(b.isBefore(a)){
			return this.getAreaMenuFromCache(city);
		}
	}
	return {
		'error' : 304,
		'city' : city,
	};
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
			return a['index'] - b['index'];
		});
		g_db_query_cache['ad_image'][position]['dirty'] = false;

		return g_db_query_cache['ad_image'][position]['result'];
	}
	return [];
}

exports.removeAd = function(removeAdJson){
	let find = false;
	let position = Number(removeAdJson['position']);
	if(position in g_db_cache['ad_image']){
		for(var key in g_db_cache['ad_image'][position]){
			var adBean = g_db_cache['ad_image'][position][key];
			if(adBean.getIndex() == removeAdJson['index']){
				g_db_cache['ad_image'][position].splice(key,1);
				find = true;
				break;
			}
		}
	}
	if(find){
		if(position in g_db_query_cache['ad_image']){
			g_db_query_cache['ad_image'][position]['dirty'] = true;
		}
	}
	return;
}

exports.changeAd = function(addAdJson,isAdd){
	var findItem = false;
	var position = Number(addAdJson['position']);
	if(position in g_db_cache['ad_image']){
		for(var key in g_db_cache['ad_image'][position]){
			var adBean = g_db_cache['ad_image'][position][key];
			if(adBean.getIndex() == addAdJson['index']){
				findItem = true;
				if(isAdd){
					break;
				}
				adBean.setImage(addAdJson['image']);
				break;
			}
		}
	}
	if(isAdd && findItem){
		return {
			'error' : 100001,
			'error_msg':'添加已经存在的广告'
		};
	}
	if(!isAdd && !findItem){
		return {
			'error' : 100002,
			'error_msg' : '更新的广告并没有找到',
		}

	}

	if(isAdd && !findItem){
		if(position in g_db_cache['ad_image']){
			g_db_cache['ad_image'][position].push(new AdBean(addAdJson));
		}else{
			g_db_cache['ad_image'][position] = [new AdBean(addAdJson)];
		}
	}

	if(!(position in g_db_query_cache['ad_image'])){
		g_db_query_cache['ad_image'][position] = {
			'dirty' : true,
			'result' : []
		};
	}else{
		g_db_query_cache['ad_image'][position]['dirty'] = true;
	}
	
}


exports.modifyArea = function(param){
	let city = param['city'];
	if(city in g_db_cache['area_menu']){
		for(var k in g_db_cache['area_menu'][city]['list']){
			if(g_db_cache['area_menu'][city]['list'][k].getCode() == param['code']){
				g_db_cache['area_menu'][city]['Last_Modified'] =  moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
				g_db_cache['area_menu'][city]['list'][k].initFromDbRow(param);
				return null;
			}
		}
	}

	return {
		error:'2',
		error_msg:"没有找到area:" + util.inspect(param),
	};
}

exports.addArea = function(param){
	let city = param['city'];

	if(!(city in g_db_cache['area_menu'])){
		g_db_cache['area_menu'][city] = {
			'list' : [],
			'Last_Modified' : moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
		};
	}

	for(var k in g_db_cache['area_menu'][city]['list']){
		let bean = g_db_cache['area_menu'][city]['list'][k];
		if(bean.getCode() == param['code']){
			return {
				error : 2,
				'error_msg' : '添加时已经有重复的area:' + util.inspect(param),
			};
		}
	}
	let bean = new AreaBean();
	bean.initFromDbRow(param);
	g_db_cache['area_menu'][city]['list'].push(bean);

	return null;

}

exports.removeArea = function(city,code){
	if(!(city in g_db_cache['area_menu'])){
		return {
			'error' : 2,
			'error_msg' : '删除指定菜单时,没有找到area',
		};
	}

	for(var k in g_db_cache['area_menu'][city]['list']){
		var bean = g_db_cache['area_menu'][city]['list'][k];
		if(bean.getCode() == param['code']){
			g_db_cache['area_menu'][city]['Last_Modified'] =  moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
			delete g_db_cache['area_menu'][city][k];
			return null;
		}
	}
	return {
		'error' : 2,
		'error_msg' : '删除指定菜单时,没有找到area',
	};
}

DbCacheManager.prototype.getCategory = function(){
	var list = [];
	for(var i in g_db_cache['category_menu']){
		list.push(g_db_cache['category_menu'][i].getJsonValue());
	}
	return list;
}