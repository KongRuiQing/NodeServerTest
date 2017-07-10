"use strict";
var util = require("util");
var ScheduleRouteBean = require("./ScheduleRouteBean.js");
var moment = require("moment");
var PlayerAttentionShopInfo = function(shop_id, attention_time, remark) {
	this.shop_id = Number(shop_id);
	this.attention_time = attention_time;
	this.remark = remark;
};

PlayerAttentionShopInfo.prototype.getJsonValue = function() {
	return {
		'shop_id': this.shop_id,
		'attention_time': this.attention_time,
		'remark': this.remark,
	};
}
PlayerAttentionShopInfo.prototype.getShopId = function() {
	return this.shop_id;
}


var PlayerFavoritesItemInfo = function(shop_id, item_id, add_favorites_time) {
	this.shop_id = shop_id;
	this.item_id = item_id;
	this.add_favorites_time = add_favorites_time;
};

PlayerFavoritesItemInfo.prototype.getJsonValue = function() {

	return {
		'shop_id': this.shop_id,
		'item_id': this.item_id,
		'add_favorites_time': this.add_favorites_time
	};
}

PlayerFavoritesItemInfo.prototype.getItemId = function() {
	return this.item_id;
}


var Player = function() {
	this.id = 0;

	this.attention_shop = [];
	this.favorites = [];

	this.login_account = "";
	this.login_password = "";
	this.state = 2;

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
	this.shop_state = 0;
	this.schedule = [
		new ScheduleRouteBean(1),
		new ScheduleRouteBean(2),
		new ScheduleRouteBean(3),
		new ScheduleRouteBean(4),
		new ScheduleRouteBean(5),
	];

}

Player.prototype.getName = function(){
	return this.name;
}

Player.prototype.initNewPlayer = function(uid) {
	this.id = Number(uid);
	this.head = "";
	this.sex = 1;
	this.shop_id = 0;
	//this.nick_name = "用户" + uid;
	this.name = "用户" + uid;
}

Player.prototype.setUserInfo = function(db_row) {
	// user info
	this.id = Number(db_row['id']);
	if ('head' in db_row) {
		this.head = db_row['head'];
	}
	this.name = db_row['name'];
	this.birthday_timestamp = moment(db_row).format("YYYY-MM-DD HH:mm:ss");
	this.sign = db_row['sign'];
	this.address = db_row['address'];
	this.telephone = db_row['telephone'];
	this.email = db_row['email'];
	this.real_name = db_row['real_name'];
	this.sex = Number(db_row['sex']);


};



Player.prototype.ChangeUserInfo = function(
	head, name, birthday_timestamp, sign, address, telephone, email, real_name, sex) {

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

Player.prototype.setLoginInfo = function(login_account, login_password, state) {

	this.login_account = login_account;
	this.login_password = login_password;
	this.state = state;
}


Player.prototype.login = function() {
	this.last_login_time = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
}

Player.prototype.attentionShop = function(shop_id, attention_time, remark) {
	let findAttentionIndex = this.attention_shop.findIndex(function(attention) {
		return attention['shop_id'] == shop_id;
	});
	if (findAttentionIndex >= 0) {
		//this.attention_shop[findAttentionIndex]
	} else {
		var info = new PlayerAttentionShopInfo(shop_id, attention_time, remark);
		this.attention_shop.push(info);
	}

}

Player.prototype.cancelAttentionShop = function(shop_id) {
	let findAttentionIndex = this.attention_shop.findIndex(function(attention) {
		return attention['shop_id'] == shop_id;
	});
	if (findAttentionIndex >= 0) {
		this.attention_shop.splice(findAttentionIndex, 1);
	}
}


Player.prototype.addFavoritesItem = function(shop_id, item_id, add_favorites_time) {
	var info = new PlayerFavoritesItemInfo(shop_id, item_id, add_favorites_time);
	this.favorites.push(info);
}

Player.prototype.removeFavoritesItem = function(item_id) {
	for (var i = 0; i < this.favorites.length; ++i) {
		if (this.favorites[i].getItemId() == item_id) {
			this.favorites.splice(i, 1);
			break;
		}
	}
}

Player.prototype.canLogin = function(login_password) {

	console.log(`this.login_password='${this.login_password}' == '${login_password}'`);
	if (this.login_password != login_password) {
		return 1008
	}
	if (this.state == 1) {
		return 1009;
	}

	return 0;
}

Player.prototype.getUserLoginInfo = function() {
	var json_login = {};

	json_login['uid'] = this.id;


	json_login['head'] = this.head;
	json_login['nick_name'] = this.name;
	json_login['sex'] = this.sex;

	if (this.birthday_timestamp) {
		json_login['birthday_timestamp'] = moment(this.birthday_timestamp).format("YYYY-MM-DD HH:mm:ss");
	}

	json_login['sign'] = this.sign;
	json_login['address'] = this.address;
	json_login['telephone'] = this.telephone;
	json_login['email'] = this.email;
	json_login['real_name'] = this.real_name;
	//json_login['shop_id'] = this.shop_id;
	//json_login['shop_state'] = this.shop_state;
	
	//json_login['shop_state'] = 0;
	return json_login;
}

Player.prototype.getMyFavoritemItems = function() {
	var json_result = [];
	for (var i = 0; i < this.favorites.length; ++i) {
		json_result.push(this.favorites[i].getJsonValue());
	}
	return json_result;
}


Player.prototype.getMyAttention = function() {
	var list = [];
	for (var key in this.attention_shop) {
		list.push(this.attention_shop[key].getJsonValue());
	}
	return list;
}

Player.prototype.getShopId = function() {

	return this.shop_id;
}


Player.prototype.getHead = function() {
	return this.head;
}

Player.prototype.hasFavoritesItem = function(favorites_item_id) {
	for (var key in this.favorites) {
		if (this.favorites[key].getItemId() == favorites_item_id) {
			return true;
		}
	}

	return false;
}

Player.prototype.hasAttentionShop = function(shop_id) {
	for (var key in this.attention_shop) {
		if (this.attention_shop[key].getShopId() == shop_id) {
			return true;
		}
	}

	return false;
}

Player.prototype.setScheduleImage = function(schedule_id, image) {
	for (var key in this.schedule) {
		if (this.schedule[key].getId() == schedule_id) {
			this.schedule[key].setScheduleImage(image);
			break;
		}
	}

}

Player.prototype.addScheduleShopId = function(schedule_id, shop_id) {

	for (var key in this.schedule) {
		if (this.schedule[key].getId() == schedule_id) {

			this.schedule[key].addShop(shop_id);
			break;
		}
	}
	//console.log(util.inspect(this.schedule));

}

Player.prototype.setScheduleShopImage = function(schedule_id, shop_id, image_index, image) {
	for (var key in this.schedule) {
		if (this.schedule[key].getId() == schedule_id) {
			this.schedule[key].addShopImage(shop_id, image_index, image);
		}
	}

}

Player.prototype.setScheduleShopComment = function(schedule_id, shop_id, comment) {
	for (var key in this.schedule) {
		if (this.schedule[key].getId() == schedule_id) {
			this.schedule[key].addShopComment(shop_id, comment);
		}
	}

}

Player.prototype.getScheduleRouteInfo = function() {
	var json_result = {};
	json_result['list'] = [];

	for (var key in this.schedule) {
		json_result['list'].push(this.schedule[key].getJsonValue());
	}

	return json_result;
}

Player.prototype.ChangeScheduleImage = function(schedule_id, shop_id, image_index, image) {
	for (var key in this.schedule) {
		if (this.schedule[key].getId() == schedule_id) {
			this.schedule[key].ChangeScheduleImage(shop_id, image_index, image);
		}
	}

}

Player.prototype.getOneScheduleRouteInfo = function(schedule_id) {
	for (var key in this.schedule) {
		if (this.schedule[key].getId() == schedule_id) {
			return this.schedule[key].getJsonValue();
		}
	}

}

Player.prototype.ChangeScheduleRouteImage = function(schedule_id, image) {
	for (var key in this.schedule) {
		console.log("exec: key=[" + key + "]" + this.schedule[key].getId());
		if (this.schedule[key].getId() == schedule_id) {
			this.schedule[key].ChangeScheduleRouteImage(image);
		}
	}

}

Player.prototype.updateUserInfo = function(db_result) {
	var schedule_info = db_result[0];
	var index = 0;
	//console.log(this.schedule);
	for (var key in schedule_info) {
		if (index >= this.schedule.length) {
			break;
		}
		this.schedule[index].initFromDbRow(schedule_info[key]);
		index += 1;
	}
}

Player.prototype.initScheduleInfo = function(sort_key, schedule_info) {
	if (sort_key >= 1 && sort_key <= this.schedule.length) {
		this.schedule[sort_key - 1].initFromDbRow(schedule_info);
		//console.log("sort_key:" + sort_key);
	}
	//
}

Player.prototype.changeScheduleTitle = function(schedule_id, schedule_name) {
	for (var key in this.schedule) {
		console.log("exec: key=[" + key + "]" + this.schedule[key].getId());
		if (this.schedule[key].getId() == schedule_id) {
			this.schedule[key].setScheduleName(schedule_name);
		}
	}
}

Player.prototype.addShopToSchedule = function(schedule_id, shop_id) {
	for (var key in this.schedule) {
		if (this.schedule[key].getId() == schedule_id) {
			let add_result = this.schedule[key].addShopByClient(shop_id);
			return add_result;
		}
	}
	return false;
}

Player.prototype.getScheduleShopCommentInfo = function(schedule_id, shop_id) {

	for (var key in this.schedule) {
		if (this.schedule[key].getId() == schedule_id) {
			console.log("123");
			return this.schedule[key].getShopCommentInfo(shop_id);
		}
	}

	return null;
}

Player.prototype.removeShopFromSchedule = function(schedule_id, shop_id) {
	for (var key in this.schedule) {
		if (this.schedule[key].getId() == schedule_id) {
			this.schedule[key].removeShopFromSchedule(shop_id);
		}
	}
}


module.exports = Player;