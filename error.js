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
}

module.exports = new ErrorCode;