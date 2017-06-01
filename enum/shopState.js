'use strict';

function parse(value){
	if(value >= 0 && value <= 3){
		return value;
	}
	return -1;
}
module.exports = {
	INVALID_SHOP : -1,
	PENDING_SHOP_STATE : 0,
	NORMAL_SHOP_STATE : 1,
	CLOSE_SHOP_STATE : 2,
	CLAIM_SHOP_STATE :3,

	parse : parse,
};