'use strict';
module.exports = {
	KICKOFF_BY_DELETE_USER: 10001, // 删除用户
	FIELD_PARAM_ERROR: 10002, // 参数不正确
	USER_NO_LOGIN: 10003, // 用户没有登录
	BE_SHOP_REPEAT: 10004, //  申请商铺时,已经有商铺 了
	BE_SHOP_CLAIM: 10005, // 申请商铺时,正在认领其它商铺
	SQL_ERROR: 10006, // 数据 库操作失败
	NOT_EXIST_ITEM: 10007, // 不存在的物品
	FAVORITE_REPEAT: 10008, // 添加收藏物品时重复
	ACCOUNT_REPEAT: 10009, // 帐号重复
	VERIFY_CODE_ERROR: 10010, // 验证码错误
	NOT_EXIST_ACCOUNT : 10011, // 帐号不存在
	CLAIM_ERROR : 10012, // 认领条件失败
	USER_NO_SHOP : 10013, // 用户没有绑定的商铺
	USER_NO_ATTENTION : 10014 , // 用户并没有关注此商铺
};
