'use strict'

var CategoryMenuBean = function(parent,name,code){
	this.__parent = Number(parent);
	this.__name = name;
	this.__code = Number(code);
}

CategoryMenuBean.prototype.getJsonValue = function() {
	return {
		'parent' : this.__parent,
		'name' : this.__name,
		'code' : this.__code
	};
};

CategoryMenuBean.prototype.getCode = function(){
	return this.__code;
}

CategoryMenuBean.prototype.getParentCode = function(){
	return this.__parent;
}

module.exports = CategoryMenuBean;