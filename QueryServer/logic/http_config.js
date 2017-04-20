'use strict';
var db = require("../../mysqlproxy");
var util = require('util');

var DbCache = require("../../cache/DbCache");
var logger = require("../../logger").logger();
var fs = require('fs');
const path = require('path');
var moment = require('moment');

exports.getCustomService = function(headers, query,callback){
	let area_code = Number.parseInt(query['area_code']);
	if(Number.isNaN(area_code)){
		callback(0,{
			'error' : 1,
			'error_msg' : '没有指定area_code',
		});
		return;
	}
	let json_list = DbCache.getInstance().getCustomService(area_code);

	callback(0,{
		'error' : 0,
		'area_code' :  area_code,
		'list' : json_list
	})
}
