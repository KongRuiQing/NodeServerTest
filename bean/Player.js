
var PlayerAttentionShopInfo = function(shop_id,attention_time){
	this.shop_id = shop_id;
	this.attention_time = attention_time;

};

PlayerAttentionShopInfo.prototype.getJsonValue = function(){
	return {
		'shop_id' : this.shop_id,
		'attention_time' : this.attention_time
	};
}

var PlayerFavoritesItemInfo = function(shop_id,item_id,add_favorites_time){
	this.shop_id = shop_id;
	this.item_id = item_id;
	this.add_favorites_time = add_favorites_time;
};



PlayerFavoritesItemInfo.prototype.getJsonValue = function{

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

Player.prototype.InitUserInfo = function(db_row) {
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

Player.prototype.ChangeUserInfo = function(){

}

Player.prototype.setLoginInfo = function(login_account,login_password,state){
	this.login_account = login_account;
	this.login_password = login_password;
	this.state = state;
}

Player.prototype.login = function(guid){
	this.guid = guid;
	this.last_login_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
}

Player.prototype.attentionShop = function(shop_id,attention_time){
	var info = new PlayerAttentionShopInfo(shop_id,attention_time);
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
	return {

	}
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

module.exports = Player;