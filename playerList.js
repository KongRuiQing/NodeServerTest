'use strict';
var db_proxy = require("./mysqlproxy");
var util = require('util');
var logger = require('./logger').logger();
var ShopProxy = require('./cache/shopCache');
var moment = require('moment');
var Player = require("./Bean/Player");
var FindUtil = require('./FindUtil');

let sms = require('./proxy/sms.js');
let RegAccountBean = require("./bean/RegAccountBean");


function PlayerManager(){
	this.player_online_list = {};
	this.playerCache = {};
	this.account_uid = {};
	this.reg_account = {};
	this.guid_to_uid = {};
	this.MaxUID = 0;
}

let g_playerlist = new PlayerManager();

let PLAYER_LIST = "playerList.js";

PlayerManager.prototype.getMyShopId = function(uid){

	if(uid in this.playerCache){
		return this.playerCache[uid].getShopId();
	}

	return 0;
}

PlayerManager.prototype.chekcCanClaim = function(uid){
	if(uid in this.playerCache){
		let userBean = this.playerCache[uid];
		if(userBean == null){
			return false;
		}
		
		if(userBean.getShopId() != 0){
			logger.log("INFO","[chekcCanClaim] shop_id =", userBean.getShopId());
			return false;
		}
		if(userBean.getClaim()  != 0){
			logger.log("INFO","[chekcCanClaim] claim =", userBean.getClaim());
			return false;
		}
		return true;
	}

	return false;
}

PlayerManager.prototype.setClaimShop = function(uid,shop_id){
	if(uid in this.playerCache){
		let userBean = this.playerCache[uid];
		if(userBean != null){
			userBean.setClaim(shop_id);
		}
	}
}

exports.getInstance = function(){
	return g_playerlist;
}


exports.InitFromDb = function(
	all_user_info,
	all_login_info,
	player_attention_shop_list,
	player_favorites_item,
	shop_claims){

	for(var i in all_login_info){

		var uid = parseInt(all_login_info[i]['Id']);
		g_playerlist['playerCache'][uid] = new Player();

		g_playerlist['playerCache'][uid].setLoginInfo(
			all_login_info[i]['Account']
			,all_login_info[i]['Password']
			,Number(all_login_info[i]['state']));
		
		g_playerlist['account_uid'][all_login_info[i]['Account']] = all_login_info[i]['Id'];
		
		g_playerlist['MaxUID'] = Math.max(g_playerlist['MaxUID'],uid);

	}

	for(var i in all_user_info){
		var uid = all_user_info[i]['id'];

		if(g_playerlist['playerCache'][uid] != null){

			g_playerlist['playerCache'][uid].setUserInfo(all_user_info[i]);
		}
	}
	//logger.log("PLAYER_LIST",'Init Player Attention Shop Num : ' + player_attention_shop_list.length);
	for(var i in player_attention_shop_list){

		var uid = player_attention_shop_list[i]['uid'];
		var shop_id = player_attention_shop_list[i]['shop_id'];
		var attention_time = player_attention_shop_list[i]['attention_time'];
		var remark = player_attention_shop_list[i]['attention_remark'];


		if(g_playerlist['playerCache'][uid] != null){
			g_playerlist['playerCache'][uid].attentionShop(shop_id,attention_time,remark);
			
		}
	}

	for(var i in player_favorites_item){
		var uid = player_favorites_item[i]['uid'];
		var item_id = player_favorites_item[i]['item_id'];
		var shop_id = player_favorites_item[i]['shop_id'];
		var add_time = player_favorites_item[i]['add_time'];
		//logger.log("PLAYER_LIST","[InitFromDb] uid = " + uid + " item_id = " + item_id);
		
		if(g_playerlist['playerCache'][uid] != null){
			g_playerlist['playerCache'][uid].addFavoritesItem(shop_id,item_id,add_time);
		}
	}
	

	logger.log(PLAYER_LIST,util.inspect(shop_claims));
	for(var i in shop_claims){
		let uid = Number(shop_claims[i]['uid']);
		let shop_id = Number(shop_claims[i]['shop_id']);
		if(uid in g_playerlist['playerCache']){
			g_playerlist['playerCache'][uid].setClaim(shop_id);
		}
	}

}

exports.CheckLogin = function(login_account,login_password){

	var uid = g_playerlist['account_uid'][login_account];
	logger.log("PLAYER_LIST",'[CheckLogin] login_account = '+ login_account +' uid:' + uid);
	if(uid == null){
		//logger.log("PLAYER_LIST",'[CheckLogin] g_playerlist["account_uid"]:' + util.inspect(g_playerlist['account_uid']));
		return 1011;
	}
	if(g_playerlist['playerCache'][uid] == null){
		//console.log("false1");
		logger.log("PLAYER_LIST",'[CheckLogin] playerCache:' + util.inspect(g_playerlist['account_uid']));
		return 1012;
	}
	var player_info = g_playerlist['playerCache'][uid];
	var error_code = player_info.canLogin(login_password);
	if(error_code > 0){
		logger.log("PLAYER_LIST","[CheckLogin] check player login result:" + error_code);
		return error_code;
	}

	return 0;
}

exports.CheckLoginByGuid = function(guid){

}


function getUTC() {  
	var d = new Date();  
	return Date.UTC(d.getFullYear()  
		, d.getMonth()  
		, d.getDate()  
		, d.getHours()  
		, d.getMinutes()  
		, d.getSeconds()  
		, d.getMilliseconds());  
} 

function generate(count) {
	var _sym = 'abcdefghijklmnopqrstuvwxyz1234567890';
	var str = '';

	for(var i = 0; i < count; i++) {
		str += _sym[parseInt(Math.random() * (_sym.length))];
	}

	str += getUTC();

	return str;
}

PlayerManager.prototype.Login = function(login_account){

	var uid = this['account_uid'][login_account];
	var player_info = this['playerCache'][uid];

	var guid = generate(10);
	//logger.log("PLAYER_LIST","[Login] account : " + login_account, + " guid:" + guid + " is login");
	this['player_online_list'][uid] = guid;
	this['guid_to_uid'][guid] = uid;

	player_info.setLoginGuid(guid);

	db_proxy.updateUserInfo(uid,updateUserInfo);

	return player_info.getUserLoginInfo();
}

function updateUserInfo(uid,db_result){
	var player_info = g_playerlist['playerCache'][uid];
	if(player_info != null){
		player_info.updateUserInfo(db_result);
	}else{
		logger.log("PLAYER_LIST","error");
	}
}

exports.Login = function(login_account){

	return g_playerlist.Login(login_account);
	
}

exports.CheckRegTelephone = function(telephone){
	var uid = g_playerlist['account_uid'][telephone];
	if(uid == null){
		return true;
	}

	return false;
}

exports.ReSendRegisterVerifyCode = function(client_guid,telephone){

	if(client_guid in g_playerlist['reg_account']){

	}

}

function GetRandomNum()
{    
	var Rand = Math.random();   
	return (Math.round(Rand * 10)) % 10;   
}   

function generateVerifyCode(){
	var chars = ['0','1','2','3','4','5','6','7','8','9'];
	var result = "";
	for(var i = 0; i < 4 ; i ++){
		result += chars[GetRandomNum()];
	}
	return result;
}

function sendRegisterVerifyCode(telephone,verify_code){
	sms.send_sms(telephone,verify_code);
}

function checkAccount(telephone){

	var uid = g_playerlist['account_uid'][telephone];
	if(uid == null){
		return true;
	}
	return false;
}

exports.RegisterStep = function(step,cuid,telephone,code,password){

	let reg_account = null;
	
	logger.log("PLAYER_LIST","[playerList][RegisterStep] params step: " + step + " telephone: " + telephone + " code: " + code + " password: " + password);

	if(cuid in g_playerlist['reg_account']){

		reg_account = g_playerlist['reg_account'][cuid];
		logger.log("PLAYER_LIST","reg_account:" + util.inspect(reg_account));

		if(step == 1){
			var check_account = checkAccount(telephone);
			if(!check_account){
				return{
					'error' : 1020
				};
			}
			
			reg_account.setTelephone(telephone);
			reg_account.setStep(1);
			reg_account.setVerifyCode(generateVerifyCode(),FindUtil.getCurrentTime());
			sendRegisterVerifyCode(telephone,reg_account.getVerifyCode());
		}else if(step != reg_account.step()){
			return {
				'error' : 1019,
			};
		}
	}else{
		if(step != 1){
			return {
				'error' : 1019,
			};
		}
		var check_account = checkAccount(telephone);
		if(!check_account){
			return{
				'error' : 1020
			};
		}

		reg_account = new RegAccountBean(cuid);
		g_playerlist['reg_account'][cuid] = reg_account;
		reg_account.setTelephone(telephone);
		reg_account.setVerifyCode(generateVerifyCode(),FindUtil.getCurrentTime());
		sendRegisterVerifyCode(telephone,reg_account.getVerifyCode());

		//logger.log("PLAYER_LIST","! reg_account:" + util.inspect(reg_account));
	}
	var check_account = checkAccount(telephone);
	if(!check_account){
		return{
			'error' : 1020
		};
	}

	reg_account.verifyRegisterStep(telephone,code,password);
	logger.log("PLAYER_LIST","[playerList.js][RegisterStep] reg_account = " + util.inspect(reg_account));
	if(reg_account != null){
		if(reg_account.step() == 4){
			var uid = g_playerlist.Register(telephone,password);

			var loginInfo = g_playerlist.Login(telephone);

			g_playerlist['reg_account'][cuid] = null;

			loginInfo['step'] = 4;
			loginInfo['uid'] = uid;
			return loginInfo;
		}

		console.log("reg_account.result():" + util.inspect(reg_account.result()));
		return reg_account.result();
	}
}


exports.RegisterStep1 = function(step,client_guid,telephone,code,password){
	
	if(step == 1){
		var uid = g_playerlist['account_uid'][telephone];
		if( uid == null ){
			var guid = generate(10);

			g_playerlist['reg_account'][guid] = {
				"guid" : guid,
				'telephone':telephone,
				'code' : '1234',
			};
			return {
				"guid" : guid,
				'telephone':telephone,
				'code' : '1234',
				'step':2,
			};

		}else{
			return {
				'error' : 2
			};
		}
		// 
	}else if(step == 2){
		var uid = g_playerlist['account_uid'][telephone];
		
		if(!uid && client_guid){
			var reg = g_playerlist['reg_account'][client_guid];
			if(!reg){
				return {
					'error' : 1
				}
			}else{
				if(reg['telephone'] == telephone && reg['code'] == code){
					return {
						"guid" : client_guid,
						'telephone':telephone,
						'code' : reg['code'],
						'step' : 3
					};
				}else
				{
					return {
						"error":3
					};
				}
			}
		}else {
			return {
				"error":2
			};
		}
		
	}else if(step == 3){
		var uid = g_playerlist['account_uid'][telephone];
		
		if(!uid && client_guid){
			//console.log("reg_account = " + util.inspect(this.reg_account));
			var reg = g_playerlist['reg_account'][client_guid];
			if(!reg){
				return {
					'error' : 1
				}
			}else{
				if(reg['telephone'] == telephone && reg['code'] == code){
					var uid = g_playerlist.Register(telephone,password);

					var loginInfo = g_playerlist.Login(telephone);

					loginInfo['step'] = 4;
					loginInfo['uid'] = uid;

					g_playerlist['reg_account'][client_guid] = null;

					return loginInfo;
				}else{
					return {
						"error":3
					};
				}
			}

		}else{
			return {
				"error":2
			};
		}
	}

	return 0;
}

function newPlayer(uid){
	var player = new Player();
	player.initNewPlayer(uid);
	//logger.log("PLAYER_LIST",util.inspect(player));
	return player;
}

g_playerlist.Register = function(telephone,password){
	var uid = this['account_uid'][telephone];
	if(uid != null){
		return false;
	}
	uid = this.MaxUID + 1;
	this.MaxUID = g_playerlist.MaxUID + 1;

	this['account_uid'][telephone] = uid;

	this['player_online_list'][uid] = {};

	this['playerCache'][uid] = newPlayer(uid);
	
	//this['account_uid'][telephone] = uid;

	this['reg_account'][telephone] = null;

	db_proxy.AddNewPlayer(uid,telephone,password,function(success){
		if(success){
			logger.log("PLAYER_LIST","Register success")
		}
	});
	return uid;
}

exports.getMyFavoritesItems = function(guid,page){
	var uid = g_playerlist['guid_to_uid'][guid];
	var page_size = 15;
	if(uid != null){
		var player_info = g_playerlist['playerCache'][uid];
		if(player_info != null){
			var list = player_info.getMyFavoritemItems(page,page_size);
			//logger.log("PLAYER_LIST","[getMyFavoritemItems] list= " + util.inspect(list));
			return list;
			//return player_info['favorites'].slice((page - 1) * 15,page * 15 - 1);
		}
	}
	logger.warn("PLAYER_LIST","[getMyFavoritesItems] can't find uid or player info");
	return [];
}

exports.getMyAttention = function(guid){

	var uid = g_playerlist['guid_to_uid'][guid];

	if(uid == null){
		logger.warn("PLAYER_LIST","getMyAttention:uid = 1,guid:" + guid);
		logger.log("PLAYER_LIST","All guid is:");
		logger.log("PLAYER_LIST","All guid is:" + util.inspect(g_playerlist['guid_to_uid']));
		return [];
	}
	//logger.log("PLAYER_LIST","[getMyAttention] uid: " + uid);

	var player_info = g_playerlist['playerCache'][uid];

	if(player_info != null){
		return player_info.getMyAttention();
	}
	return [];
}


exports.CheckSeller = function(guid){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid == null){
		logger.warn("PLAYER_LIST","CheckSeller:uid = null,guid:" + guid);
		logger.log("PLAYER_LIST","All guid is:");
		logger.log("PLAYER_LIST","All guid is:" + util.inspect(g_playerlist['guid_to_uid']));
		return {
			'error' : 1
		};
	}

	//logger.log("PLAYER_LIST","uid = " + uid);
	var player_info = g_playerlist['playerCache'][uid];
	if(player_info == null || player_info.isSeller()){
		return 0;
	}
	//logger.log("PLAYER_LIST",util.inspect(g_playerlist['playerCache']));

	return uid;
}

PlayerManager.prototype.SetUserShopId = function(uid,shop_id,shop_state){
	if(uid > 0){
		if(uid in this.playerCache){
			var player_info = this.playerCache[uid];

			player_info.beSeller(shop_id,shop_state);
			return null;
		}
	}

	return {
		'error' : 1,
		'error_msg' : '没有找到用户',
	};
	
}


exports.attentionShop = function(guid,shop_id){

	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid == null || uid == 0){
		logger.error("PLAYER_LIST","[attentionShop] No guid find in guid: " + guid);
		return null;
	}
	var player_info = g_playerlist['playerCache'][uid];
	if(player_info == null){
		logger.error("PLAYER_LIST","[attentionShop] No player info find uid: " + uid);
		return null;
	}
	var find_attention_shop = false;
	for(var i in player_info['attention_shop']){
		if(player_info['attention_shop'][i]['shop_id'] == shop_id){
			find_attention_shop = true;
			break;
		}
	}

	if(!find_attention_shop){

		var now_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
		player_info.attentionShop(shop_id,now_time,"");

		logger.log("PLAYER_LIST","[playerList][attentionShop] all attention list:" + util.inspect(player_info.getMyAttention()));

		return {
			'error' : 0,
			'uid' : uid,
			'attention_time' : now_time
		};
		
	}else{

		return {'error' : 1005};
	}
}

exports.getUid = function(guid){
	if(guid in g_playerlist['guid_to_uid']){
		return g_playerlist['guid_to_uid'][guid];
	}
	return null;
	
}


exports.addToFavorites = function(guid,shop_id,item_id){
	var uid = g_playerlist['guid_to_uid'][guid];

	if(uid != null && uid > 0){
		var player_info = g_playerlist['playerCache'][uid];

		if(player_info != null){
			for(var i in player_info['favorites']){
				if(item_id == player_info['favorites'][i]['item_id']){
					return 0;
				}
			}
			var now_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
			player_info.addFavoritesItem(shop_id,item_id,now_time);
			
			//logger.log("PLAYER_LIST",moment(now).format('YYYY-MM-DD HH:mm:ss'));
		}
		
		return uid;
	}
	return 0;
}

exports.changeUserInfo = function(uid,user_info_list){
	if(uid in g_playerlist['playerCache']){

		var player_info = g_playerlist['playerCache'][uid];

		if(player_info != null){
			player_info.ChangeUserInfo(
				 user_info_list[9] // head image
				,user_info_list[0] // name
				,user_info_list[2] // birthday_timestamp
				,user_info_list[3] // sign
				,user_info_list[4] // address
				,user_info_list[7] // telephone
				,user_info_list[5] // email
				,user_info_list[6] // real_name
				,user_info_list[1] // sex
				,player_info.getShopId() // shop_id
				);
		}
	}
	
}

exports.getShopId = function(guid){
	if(guid in g_playerlist['guid_to_uid']){
		var uid = g_playerlist['guid_to_uid'][guid];
		if(uid in g_playerlist['playerCache']){
			return g_playerlist['playerCache'][uid].getShopId();
		}
	}

	return 0;
}

exports.removeFavoritesItem = function(guid,favorites_id){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid != null && uid > 0){
		var player_info = g_playerlist['playerCache'][uid];

		if(player_info.hasFavoritesItem(favorites_id)){
			player_info.removeFavoritesItem(favorites_id);
			var list = player_info.getMyFavoritemItems();
			//logger.log("PLAYER_LIST","[removeFavoritesItem]" + util.inspect(list));
			return {
				'item_id' : favorites_id,
				'uid' : uid
			};

		}else{

		}

		
	}

	return null;
}

exports.checkMyActivity = function(guid){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid > 0){
		var player_info = g_playerlist['playerCache'][uid];
		if(player_info != null){
			var shop_id = player_info.getShopId();
			if(shop_id > 0){
				return {
					"uid" : uid,
					"shop_id" : shop_id
				};
			}
		}
	}

	return null;
}

exports.checkRenewalActivity = function(guid){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid > 0){
		var player_info = g_playerlist['playerCache'][uid];
		if(player_info != null){
			var shop_id = player_info.getShopId();
			if(shop_id > 0){
				return {
					'error' : 0,
					'shop_id' : shop_id,
					'uid' : uid
				};
			}
		}
	}

	return {
		'error' : 1
	};	
}

exports.cancelAttentionShop = function(guid,shop_id){
	var uid = g_playerlist['guid_to_uid'][guid];

	if(uid > 0){
		var player_info = g_playerlist['playerCache'][uid];

		if(player_info != null && player_info.hasAttentionShop(shop_id)){
			player_info.cancelAttentionShop(shop_id);
			logger.log("PLAYER_LIST","[playerlist.js][cancelAttentionShop] all attention shop: " + util.inspect(player_info.getMyAttention()));
			return {
				'uid' : uid
			};
		}
	}else{
		logger.warn("PLAYER_LIST","[playerlist.js][cancelAttentionShop]  error:" +  1001);
		return {
			'error' : '1001'
		};
	}

	return null;
}

exports.getMyScheduleRouteInfo = function(guid){
	var uid = g_playerlist['guid_to_uid'][guid];
	
	//logger.log("PLAYER_LIST","[playerList][getMyScheduleRouteInfo] uid" + uid);
	if(uid > 0){
		var player_info = g_playerlist['playerCache'][uid];
		if(player_info != null){
			return player_info.getScheduleRouteInfo();
		}

	}
	return {};
}

exports.ChangeScheduleImage = function(guid,schedule_id,shop_id,image_index,image){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid > 0){
		var player_info = g_playerlist['playerCache'][uid];
		if(player_info != null){
			player_info.ChangeScheduleImage(schedule_id,shop_id,image_index,image);

			return player_info.getOneScheduleRouteInfo(schedule_id);
		}
	}
}

exports.ChangeScheduleRouteImage = function(guid,schedule_id,image){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid > 0){
		var player_info = g_playerlist['playerCache'][uid];
		if(player_info != null){
			player_info.ChangeScheduleRouteImage(schedule_id,image);
			logger.log("PLAYER_LIST","params:" + util.inspect(player_info.getOneScheduleRouteInfo(schedule_id)));
			return player_info.getOneScheduleRouteInfo(schedule_id);
		}
	}
	logger.log("PLAYER_LIST","ChangeScheduleRouteImage can't find uid in g_playerlist");
	return null;
}

exports.changeScheduleTitle = function(guid,schedule_id,schedule_name){
	var uid = g_playerlist['guid_to_uid'][guid];
	if(uid > 0){
		var player_info = g_playerlist['playerCache'][uid];
		if(player_info != null){
			player_info.changeScheduleTitle(schedule_id,schedule_name);
		}
		return {
			'uid' : uid
		};
	}
}

exports.addShopToSchedule = function(guid,shop_id,schedule_id){
	let uid = g_playerlist['guid_to_uid'][guid];
	if(uid > 0){
		var player_info = g_playerlist['playerCache'][uid];
		if(player_info != null){
			let result = player_info.addShopToSchedule(schedule_id,shop_id);
			if(result){
				return {
					'uid' : uid
				};
			}else{
				return {
					'error' : 1024
				}
			}
		}
	}

	return {
		'error' : 1001
	};
}

exports.getScheduleShopCommentInfo = function(guid,schedule_id,shop_id){
	let uid = g_playerlist['guid_to_uid'][guid];
	if(uid > 0){
		var player_info = g_playerlist['playerCache'][uid];
		if(player_info != null){
			return player_info.getScheduleShopCommentInfo(schedule_id,shop_id);
		}
	}
	return null;
}

exports.removeShopFromSchedule = function(guid,schedule_id,shop_id){
	let uid = g_playerlist['guid_to_uid'][guid];
	if(uid != null && uid > 0){
		let player_info = g_playerlist['playerCache'][uid];
		if(player_info != null){
			return player_info.removeShopFromSchedule(schedule_id,shop_id);
		}
	}

	return null;
}