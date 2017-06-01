'use strict';
class ErrorCode{

	get KICKOFF_BY_DELETE_USER(){
		return 10001; // 删除用户
	}
	get FIELD_PARAM_ERROR(){
		return 10002; // 参数不正确 
	}

	get USER_NO_LOGIN(){
		return 10003; // 用户没有登录 
	}

	get BE_SHOP_REPEAT(){
		return 10004; //  申请商铺时,已经有商铺 了
	}
	get BE_SHOP_CLAIM(){
		return 10005; // 申请商铺时,正在认领其它商铺
	}
	get NOT_LOGIN(){
		return 10006 ; //没有登录 
	}
}

module.exports = new ErrorCode;