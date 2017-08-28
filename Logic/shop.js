'use strict';

var _db = require("../db_sequelize");
const EventEmitter = require('events');
const ErrorCode = require("../error.js");
var logger = require('../logger').logger();
const ShopState = require("../enum/shopState.js")

var ShopEventDispatcher = require("../EventDispatcher/ShopEventDispatcher.js");

class ShopService extends EventEmitter {
	constructor(){
		super();
		this.__ownShop = new Map(); // uid -> shop_id,
		

		this.__pendingShop = new Map(); // shop_id -> uid;
		
		this.__shopState = new Map(); // shop_id state

		this.__shopClaim = new Map();
	}
	closeShop(uid,callback){
		if(this.__ownShop.has(uid)){
			let shop_id = this.__ownShop.get(uid);
			
			let that = this;
			_db.closeShop(shop_id,(error)=>{
				if(!error){
					that.__ownShop.delete(uid);
					that.__shopState.delete(shop_id);

					that.emit('close_shop_by_player',shop_id,uid);
				}
				callback(error);
				
			});
			return;
		}else{
			callback('no found');
			return;
		}
	}
	getOnlineShopList(){
		let shop_list = [];
		this.__shopState.forEach((state,shop_id)=>{
			if(state == ShopState.NORMAL_SHOP_STATE){
				shop_list.push(shop_id);
			}
			if(state == ShopState.CLAIM_SHOP_STATE){
				shop_list.push(shop_id);
			}
		});
		return shop_list;
	}
	addShopIdWithUid(uid,shop_id,state){
		if(this.__ownShop.has(uid)){

		}
		this.__shopState.set(shop_id,state);

		if(state == ShopState.NORMAL_SHOP_STATE){
			this.__ownShop.set(uid,shop_id);
		}else if(state == ShopState.PENDING_SHOP_STATE){
			this.__pendingShop.set(shop_id,uid);
		}else if(state == ShopState.CLAIM_SHOP_STATE){
			
		}else if(state == ShopState.CLOSE_SHOP_STATE){
			this.__ownShop.set(uid,shop_id);
		}
	}
	addClaim(uid,shop_id){
		this.__shopClaim.set(uid,shop_id);
	}

	checkBeShop(uid){
		if(this.__ownShop.has(uid)){
			return ErrorCode.BE_SHOP_REPEAT;
		}
		if(this.__shopClaim.has(uid)){
			return ErrorCode.BE_SHOP_CLAIM;
		}
		return 0;
	};

	requestBeShop(shop_info,callback){
		let that = this;
		_db.insertRequestBeSeller(shop_info,(error,db_row)=>{
			if(error){
				callback(error);
			}else{
				that.addShopIdWithUid(db_row['uid'],db_row['Id'],db_row['state']);
				that.emit('new_shop',db_row);
				callback(null,db_row);
			}
		});
	}

	getUidByShopId(find_shop_id){
		let find_uid = 0;

		this.__ownShop.forEach((shop_id,uid)=>{
			if(find_shop_id == shop_id){
				find_uid = uid;
			}
		});
		return find_uid;
	}
	getOwnShopId(uid){
		if(typeof uid != 'number'){
			uid = Number(uid);
		}

		if(this.__ownShop.has(uid)){
			return this.__ownShop.get(uid);
		}
		return 0;
	}

	getBindShopId(uid){
		if(typeof uid != 'number'){
			uid = Number(uid);
		}

		let shop_id = this.getOwnShopId(uid);
		if(shop_id > 0){
			return shop_id;
		}

		this.__pendingShop.forEach((_uid,_shop_id)=>{
			if(_uid == uid){
				shop_id = _shop_id;
				return true;
			}
			return false;
		});

		return shop_id;
		
	}
	getClaimShop(uid){
		if(this.__shopClaim.has(uid)){
			return this.__shopClaim.get(uid);
		}
		return 0;
	}
	getCliamPlayer(shop_id){
		let find_uid = 0;
		this.__shopClaim.forEach((_shop_id,uid)=>{
			if(_shop_id == shop_id){
				find_uid = uid;
			}
		});
		return find_uid;
	}
	checkCanClaim(uid,shop_id){
		if(this.__shopClaim.has(uid)){
			return false;
		}
		let state = this.getShopState(shop_id);
		if(state != ShopState.CLAIM_SHOP_STATE){
			return false;
		}
		let claim_shop_uid = this.getCliamPlayer(shop_id);
		if(claim_shop_uid != 0){
			return false;
		}
		return true;
	}

	getShopState(shop_id){
		if(this.__shopState.has(shop_id)){
			return this.__shopState.get(shop_id);
		}
		return ShopState.INVALID_SHOP;
	}

	changeShopState(shop_id,to_state){
		logger.log("INFO","[Logic/Shop]changeShopState shop_id:%d,to_state %d",shop_id,to_state);
		if(this.__shopState.has(shop_id)){
			let from_state = this.__shopState.get(shop_id);
			logger.log("INFO","[ShopService][changeShopState]",`shop_id(${shop_id}) from(${from_state}) to ${to_state}`);
			if(to_state == ShopState.NORMAL_SHOP_STATE){
				if(from_state == ShopState.PENDING_SHOP_STATE){
					let uid = this.__pendingShop.get(shop_id);
					this.__ownShop.set(uid,shop_id);
					this.__pendingShop.delete(shop_id);
					this.__shopState.set(shop_id,to_state);
					logger.log("INFO",'[ShopService][changeShopState] data:','uid->',uid,'shop_id->',shop_id );
					logger.log("INFO","[Shop] emit pass_pending_shop");
					this.emit('pass_pending_shop',uid,shop_id);

					ShopEventDispatcher.fireEvent('pass_pending_shop',shop_id);
					return uid;
				}
				if(from_state == ShopState.CLOSE_SHOP_STATE){
					let uid = this.getUidByShopId(shop_id);
					this.__shopState.set(shop_id,to_state);
					this.emit('pass_close_shop',uid,shop_id);

					return uid;
				}
			}
			if(to_state == ShopState.PENDING_SHOP_STATE){
				if(from_state == ShopState.NORMAL_SHOP_STATE){
					let uid = this.getUidByShopId(shop_id);
					this.__ownShop.delete(uid);
					this.__pendingShop.set(shop_id,uid);
					this.__shopState.set(shop_id,to_state);
					this.emit('to_pending_shop',uid,shop_id);
					return uid;
				}
			}
			if(to_state == ShopState.CLOSE_SHOP_STATE){
				if(from_state == ShopState.NORMAL_SHOP_STATE){
					let uid = this.getUidByShopId(shop_id);
					this.__shopState.set(shop_id,to_state);
					this.emit('close_shop_by_admin',uid,shop_id);

					return uid;
				}
			}
			
		}else{
			logger.log("ERROR",`shop_id(${shop_id}) is not in this.__shopState`);
		}
		return 0;
	}

}

module.exports = new ShopService();