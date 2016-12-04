"use strict";

var PlayerAttentionShopInfo = function(shop_id,attention_time,remark){
	this.shop_id = Number(shop_id);
	this.attention_time = attention_time;
	this.remark = remark;
};

PlayerAttentionShopInfo.prototype.getJsonValue = function(){
	return {
		'shop_id' : this.shop_id,
		'attention_time' : this.attention_time,
		'remark' : this.remark,
	};
}
PlayerAttentionShopInfo.prototype.getShopId = function(){
	return this.shop_id;
}


var PlayerFavoritesItemInfo = function(shop_id,item_id,add_favorites_time){
	this.shop_id = shop_id;
	this.item_id = item_id;
	this.add_favorites_time = add_favorites_time;
};

PlayerFavoritesItemInfo.prototype.getJsonValue = function(){

	return {
		'shop_id' : this.shop_id,
		'item_id' : this.item_id,
		'add_favorites_time' : this.add_favorites_time
	};
}

PlayerFavoritesItemInfo.prototype.getItemId = function(){
	return this.item_id;
}


var Player = function(){
	this.id = 0;

	this.attention_shop = [];
	this.favorites = [];

	this.login_account = "";
	this.login_password = "";
	this.state = 2;
	this.guid = "";
	this.last_login_time = "";

	this.head = "";
	this.name = "";
	this.birthday_timestamp = "";
	this.sign = "";
	this.address = "";
	this.telephone = "";
	this.email = "";
	this.real_name = "";
	this.sex = 0;
	this.shop_id = 0;

}

Player.prototype.initNewPlayer = function(uid){
	this.id = Number(uid);
	this.head = "player/default.png";
	this.sex = 0;
	this.shop_id = 0;
	this.nick_name = "用户" + uid;
}

Player.prototype.setUserInfo = function(db_row) {
	// user info
	this.id = Number(db_row['id']);
	this.head = db_row['head'];
	this.name = db_row['name'];
	this.birthday_timestamp = db_row['birthday_timestamp'];
	this.sign = db_row['sign'];
	this.address = db_row['address'];
	this.telephone = db_row['telephone'];
	this.email = db_row['email'];
	this.real_name = db_row['real_name'];
	this.sex = Number(db_row['sex']);
	this.shop_id = Number(db_row['shop_id']);
};



Player.prototype.ChangeUserInfo = function(
	head,name,birthday_timestamp,sign,address,telephone,email,real_name,sex){
	
	this.head = head;
	this.name = name;
	this.birthday_timestamp = birthday_timestamp;
	this.sign = sign;
	this.address = address;
	this.telephone = telephone;
	this.email = email;
	this.real_name = real_name;
	this.sex = sex;
}

Player.prototype.setLoginInfo = function(login_account,login_password,state){

	this.login_account = login_account;
	this.login_password = login_password;
	this.state = state;
}

Player.prototype.setLoginGuid = function(guid){
	this.guid = guid;
}

Player.prototype.login = function(guid){
	this.guid = guid;
	this.last_login_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
}

Player.prototype.attentionShop = function(shop_id,attention_time,remark){
	var info = new PlayerAttentionShopInfo(shop_id,attention_time,remark);
	this.attention_shop.push(info);
}

Player.prototype.cancelAttentionShop = function(shop_id){
	for(var i = 0; i < this.attention_shop.length; ++i){
		if(this.attention_shop[i].getShopId() == shop_id){
			this.attention_shop.splice(i,1);
			break;
		}
	}
}


Player.prototype.addFavoritesItem = function(shop_id,item_id,add_favorites_time){
	var info = new PlayerFavoritesItemInfo(shop_id,item_id,add_favorites_time);
	this.favorites.push(info);
}

Player.prototype.removeFavoritesItem = function(item_id){
	for(var i = 0; i < this.favorites.length; ++i){
		if(this.favorites[i].getItemId() == item_id){
			this.favorites.splice(i,1);
			break;
		}
	}
}

Player.prototype.canLogin = function(login_password){
	if(this.login_password != login_password){
		return 1008
	}
	if(this.state == 1){
		return 1009;
	}

	return 0;
}

Player.prototype.getUserLoginInfo = function(){
	var json_login = {};

	json_login['uid'] = this.id;
	json_login['guid'] = this.guid;

	json_login['head'] = this.head;
	json_login['nick_name'] = this.name;
	json_login['sex'] = this.sex;

	if(this.birthday_timestamp){
		json_login['birthday_timestamp'] = this.birthday_timestamp;
	}	
		
	json_login['sign'] = this.sign;	
	json_login['address'] = this.address;	
	json_login['telephone'] = this.telephone;	
	json_login['email'] = this.email;	
	json_login['real_name'] = this.real_name;	
	json_login['shop_id'] = this.shop_id;

	return json_login;
}

Player.prototype.getMyFavoritemItems = function(){
	var json_result = [];
	for(var i = 0; i < this.favorites.length;++i){
		json_result.push(this.favorites[i].getJsonValue());
	}
	return json_result;
}

Player.prototype.isSeller = function(){
	return this.shop_id > 0;
}

Player.prototype.beSeller = function(shop_id){
	if(this.shop_id != 0){

	}
	this.shop_id = shop_id;
}

Player.prototype.getMyAttention = function(){
	var list = [];
	for(var key in this.attention_shop){
		list.push(this.attention_shop[key].getJsonValue());
	}
	return list;
}

Player.prototype.getShopId = function(){
	return this.shop_id;
}

Player.prototype.getHead = function(){
	return this.head;
}

Player.prototype.hasFavoritesItem = function(favorites_item_id){
	for(var key in this.favorites){
		if(this.favorites[key].getItemId() == favorites_item_id){
			return true;
		}
	}

	return false;
}

Player.prototype.hasAttentionShop = function(shop_id){
	for(var key in this.attention_shop){
		if(this.attention_shop[key].getShopId() == shop_id){
			return true;
		}
	}

	return false;
}

module.exports = Player;