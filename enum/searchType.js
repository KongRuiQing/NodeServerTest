'use strict';

function parse(value){
	if(value >= 1 && value <= 2){
		return value;
	}
	return -1;
}
module.exports = {
	SEARCH_SHOP : 1,
	SEARCH_ITEM : 2,

	parse : parse,
};