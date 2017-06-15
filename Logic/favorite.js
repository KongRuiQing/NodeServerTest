'use strict';
class ItemFavoriteInfo {
	constructor() {
		this.__cache = new Map(); // item -> set(uid)
	}
	addFavoriteItem(uid, item_id) {
		if (!this.__cache.has(item_id)) {
			let player_set = new Set();
			player_set.add(uid);
			this.__cache.set(item_id, player_set);
		} else {
			let player_set = this.__cache.get(item_id);
			if (!player_set.has(uid)) {
				player_set.add(uid);
			}
		}
	}
	removeFavoriteItem(uid, item_id) {
		if (this.checkHasFavoriteItem(uid, item_id)) {
			let player_set = this.__cache.get(item_id);
			player_set.delete(item_id);
		}
	}

	checkHasFavoriteItem(uid,item_id){
		if(!this.__cache.has(item_id)){
			return false;
		}
		let player_set = this.__cache.get(item_id);

		return player_set.has(uid);
	}
	getItemFavoriteCount(item_id){
		if(!this.__cache.has(item_id)){
			return 0;
		}

		return this.__cache.get(item_id).size;
	}
}

class PlayerFavoriteInfo {
	constructor() {
		this.__cache = new Map(); // uid -> set(item)
	}
	addFavoriteItem(uid, item_id) {
		if (!this.__cache.has(uid)) {
			let item_set = new Set();
			item_set.add(item_id);
			this.__cache.set(uid, item_set);
		} else {
			let item_set = this.__cache.get(uid);
			if (!item_set.has(item_id)) {
				item_set.add(item_id);
			}
		}
	}
	removeFavoriteItem(uid, item_id) {
		if (this.checkHasFavoriteItem(uid, item_id)) {
			let item_set = this.__cache.get(uid);
			item_set.delete(item_id);
		}
	}
	checkHasFavoriteItem(uid,item_id){
		if(!this.__cache.has(uid)){
			return false;
		}
		return this.__cache.get(uid).has(item_id);
	}

	getPlayerFavoriteItems(uid) {
		if (this.__cache.has(uid)) {
			return this.__cache.get(uid).values(); // for of
		}

		return [];
	}


}

class FavoriteService {
	constructor() {
		this.__item = new ItemFavoriteInfo();
		this.__player = new PlayerFavoriteInfo();
	}

	addFavoriteItem(uid, item_id) {
		this.__item.addFavoriteItem(uid, item_id);
		this.__player.addFavoriteItem(uid, item_id);
	}
	removeFavoriteItem(uid, item_id) {
		this.__item.removeFavoriteItem(uid, item_id);
		this.__player.removeFavoriteItem(uid, item_id);
	}
	getPlayerFavoriteItems(uid) {
		return this.__player.getPlayerFavoriteItems(uid);
	}
	getItemFavoriteCount(item_id) {
		return this.__item.getItemFavoriteCount(item_id);
	}
	checkHasFavoriteItem(uid, item_id) {
		if(typeof uid != 'number'){
			uid = Number(uid);
		}
		if(typeof item_id != 'number'){
			item_id = Number(item_id);
		}
		return this.__player.checkHasFavoriteItem(uid, item_id);
	}
}


module.exports = new FavoriteService();