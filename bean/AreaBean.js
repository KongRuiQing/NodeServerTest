'use strict';

function AreaBean(){
	this.province = 0;
	this.city = 0;
	this.name = '';
	this.code = 0;
}

AreaBean.prototype.initFromDbRow = function(param) {
	this.province = Number(param['province']);
	this.city = Number(param['city']);
	this.name = param['name'];
	this.code = Number(param['code']);
};

AreaBean.prototype.getJsonValue = function(){
	return {
		'city' : this.city,
		'name' : this.name,
		'code' : this.code,
		'province' : this.province,
		'parent' : this.city,
	};
}

module.exports = AreaBean;