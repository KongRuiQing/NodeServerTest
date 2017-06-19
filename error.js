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
	
	get SQL_ERROR(){
		return 10007; // 数据 库操作失败
	}
	get NOT_EXIST_ITEM(){
		return 10008; // 不存在的物品
	}
	get FAVORITE_REPEAT(){
		return 10009; // 添加收藏物品时重复
	}
	get ACCOUNT_REPEAT(){
		return 10010; // 帐号重复
	}
}

module.exports = new ErrorCode;