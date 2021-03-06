'use strict';

var moment = require('moment');
var DbCache = require("../cache/DbCache");
var logger = require('../logger').logger();
var util = require('util');
var ShopCache = require("../cache/shopCache");


function checkParam(fields,check){
	for(var key in check){
		if(!(check[key] in fields)){

			return {
				'error':1,
				'error_msg' : '没有指定' + check[key],
			};
		}
	}

	return null;
}

/**
 * @api {post} /admin/v1/ad/ AdImage
 * @apiName /v1/ad
 * @apiGroup Ad
 * @apiVersion 0.0.1
 * @apiDescription 通知广告位发生变化
 * @apiParam {Number} position 广告位的位置,对应以下几个枚举 0 首页 1 活动 2 我的 3 行程.
 * @apiParam {Number} index 广告位的顺序,取值范围0-5,一共6个.
 * @apiParam {String} image 广告位图片地址
 * @apiParam {String} url 链接地址
 * @apiRequestExample
 * @apiSampleRequest http://139.224.227.82:12000/admin/v1/ad
 * @apiExample {http} usage:
 	http://139.224.227.82:12000/admin/v1/ad
 * @apiParamExample {json} Request-Example:
 * {
	position:1,
	index:1,
	image:"ad/1.png",
	url:'http://www.baidu.com'
 * }
 * @apiParamExample {json} Request-Example:
 * {
	position:1,
	index:1,
 * }
 * @apiSuccess {Number} error 错误号,返回0表示没有错误 
 * @apiSuccess {String} error_msg 错误详细信息
 * @apiSuccessExample {json} Response-Success-Example:
 * {
	 error:0
 * }
 * @apiSuccessExample {json} Response-Error-Example:
 * {
	 error:1,
	 error_msg:'没有指定type字段'
 * }


*/

 exports.changeAdImage = function(fields,files,callback){

 	
 }

/**
 * @api {post,patch,delete} admin/v1/shop shop
 * @apiName admin/v1/shop
 * @apiGroup SHOP
 * @apiVersion 0.0.0
 * @apiDescription 	shop
 * @apiParam {Number} id 对应商铺的id,参见上面参数对应的意义 [shop.id]
 * @apiExample {http} usage:
 	http://139.224.227.82:9891/admin/v1/shop
 	
 * @apiSuccess {Number} error 错误号,返回0表示没有错误

 * @apiParamExample {json} delete-request
 {
	id:1
 }
 * @apiSuccessExample {json} delete-response
 * {
	 error:0,
 * }
 */

 exports.shopCallback = function(fields,files,callback) {

 	logger.log("HTTP_NOTIFY","fields:" +  util.inspect(fields));

 	if(!('type' in fields)){
 		callback(true,{
 			'error' : 1,
 			'error_msg' : '没有指定type字段'
 		});
 		return;
 	}

 	let type = Number(fields['type']);
 	if(type < 0 || type > 2){
 		callback(true,{
 			'error':2,
 			'error_msg' : 'type类型指定不正确,应该为数字类型,并且值为0(删除) 1(修改) 2(添加)'
 		});
 		return;
 	}
 	if(!('id' in fields)){
 		callback(true,{
 			'error':3,
 			'error_msg' : '必须要指定商铺id',
 		});
 		return;
 	}

 	let id = Number(fields['id']);
 	if(type == 0){

 		let result = ShopCache.removeShopByShopId(id);
 		if(result != null){
 			callback(true,result);
 			return;
 		}else{
 			callback(true,{
 				'error' : 0,
 			});
 			return;
 		}
 	}else{
 		let param = {
 			"Id" : id,
 			'name' : fields['name'],
 			'beg' :fields['beg'],
 			'end' : fields['end'],
 			'days' : fields['days'],
 			'longitude' : fields['longitude'],
 			'latitude'  : fields['latitude'],
 			'city_no' : fields['city_no'],
 			'area_code' : fields['area_code'],
 			'address' : fields['address'],
 			'qualification' : fields['qualification'],
 			'category_code1' : fields['category1'],
 			'category_code2' : fields['category2'],
 			'category_code3' : fields['category3'],
 			'info' : fields['info'],
 			'distribution' : fields['distribution'],
 			'telephone' : fields['telephone'],
 			'email' : fields['email'],
 			'qq' : fields['qq'],
 			'wx' : fields['wx'],
 			'image' : fields['image'],
 			'card_image' : fields['card_image'],
 			'card_number' : fields['card_number'],
 			'state' : fields['state'],

 		}
 		let result = null;
 		if(type == 1){
 			result = ShopCache.ModifyShopByShopId(false,id,param);
 		}
 		else{
 			result = ShopCache.ModifyShopByShopId(true,id,param);
 		}

 		if(result == null){
 			callback(true,{
 				'error':0
 			});
 			return;
 		}else{
 			let error = 0;
 			callback(true,result);
 			return;
 		}
 	}
 }

/**
 * @api {post} /v1/area/ Area 
 * @apiName /v1/area
 * @apiGroup Database
 * @apiVersion 0.0.1
 * @apiDescription 通知区域发生变化(正在改)
 * @apiParam {Number} type 操作类型 0 表示删除,1表示修改,2表示添加
 * @apiParam {Number} province 省份 [area_menu.province]
 * @apiParam {Number} city 城市代码 [area_menu.city]
 * @apiParam {String} name 区域名字,如果code为0,代表是city的名字 [area_menu.name]
 * @apiParam {Number} code 区域代码,一般是city的编码*1000+索引号构成,如大连的代码是167,那么区域编码从167001开始到 167999 [area_menu.code],
 如果type是0表示删除的话,则以这个参数为标准
 * @apiExample {http} usage:
 	http://139.224.227.82:9891/admin/v1/area
 * @apiParamExample {json} Request-Example:
 * {
 	type:1
	province:6,
	city:167,
	name:'中山区',
	code:167001
 * }
 * @apiParamExample {json} Request-Example:
 * {
 	type:0
	code:167001 // 删除code为167001的区域
 * }
 * @apiSuccess {Number} error 错误号,返回0表示没有错误 
 * @apiSuccess {String} error_msg 错误详细信息
 * @apiSuccessExample {json} Response-Example-1
 * {
	 error:0
 * }
 * @apiSuccessExample {json} Response-Example-2
 * {
	 error:1
	 error_msg:'没有指定city',
 * }

 */


 exports.notifyArea = function(fields,files,callback){
 	
 }

 /**
 * @api {post,delete,patch} admin/v1/category/  Category
 * @apiName admin/v1/category
 * @apiGroup Database
 * @apiVersion 0.0.1
 * @apiDescription 通知分类发生变化
 * @apiParam {Number} parent [category_code.parent]
 * @apiParam {String} name [category_code.name]
 * @apiParam {Number} code [category_code.id]
 * @apiParam {Number} type [category_code.type]
 * @apiExample {http} usage:
 	http://139.224.227.82:9891/admin/v1/category
 * @apiSuccess {Number} error 错误号,返回0表示没有错误,其它表示错误 

 * @apiSuccessExample {json} Response-Example-1
 * {
	 error:0
 * }
 * @apiSuccessExample {json} Response-Example-2
 * {
	 error:1
 * }
 */

 exports.notifyCategory = function(fields,files,callback){
 	
 }


/**
 * @api {post,delete,patch} admin/v1/shop_cs/  shop_cs
 * @apiName admin/v1/shop_cs
 * @apiGroup Database
 * @apiVersion 0.0.1
 * @apiDescription 通知客服发生变化
 * @apiParam {Number} id [shop_cs.id]
 * @apiParam {String} title [shop_cs.title]
 * @apiParam {Number} area_code [shop_cs.area_code]

 * @apiExample {http} usage:
 	http://139.224.227.82:9891//admin/v1/shop_cs/
 * @apiSuccess {Number} error 错误号,返回0表示没有错误,其它表示错误 
 * @apiSuccessExample {json} Response-Example-1
 * {
	 error:0
 * }
 * @apiSuccessExample {json} Response-Example-2
 * {
	 error:2,
	 'error_msg' : '错误信息'
 * }
**/
exports.notifyKF = function(fields,files,callback){
 	
 }

 /**
 * @api {patch} admin/v1/shop_state  shop_state
 * @apiName admin/v1/shop_state
 * @apiGroup SHOP
 * @apiVersion 0.0.1
 * @apiDescription 通知商铺状态发生变化 
 * @apiParam {Number} shop_id [shop.Id]
 * @apiParam {Number} state [shop.state]

 * @apiExample {http} usage:
 	http://139.224.227.82:9891//admin/v1/shop_state
 * @apiSuccess {Number} error 错误号,返回0表示没有错误,其它表示错误 
 * @apiSuccessExample {json} Response-Example-1
 * {
	 error:0
 * }
 * @apiSuccessExample {json} Response-Example-2
 * {
	 error:2,
	 'error_msg' : '错误信息'
 * }
**/



