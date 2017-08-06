'use strict';
var logger = require("../logger.js").logger();
var moment = require("moment");
var _db = require("../db_sequelize");
var ShopActivityBean = require("../bean/ActivityBean.js");

class DbProxy {
	constructor() {

	}
	addActivity(shop_id, image, title, callback) {
		let json_row = {
			'shop_id': shop_id,
		};
		let count = 0;
		if (image != null) {
			json_row['image'] = image;
			count += 1;
		}
		if (title != null) {
			json_row['title'] = title;
			count += 1;
		}
		if (count > 0) {
			new Promise((resolve, reject) => {
				_db.upsertShopActivity(json_row, (error) => {
					if (error != null) {
						reject(error);
					} else {
						resolve(json_row);
					}
				});
			}).then((json_row) => {
				callback(null, json_row);
			}).catch((error) => {
				callback(error);
			});

		} else {
			callback(null, null);
		}

	}
	loadAllActivity(callback) {

		_db.loadAllShopActivity(callback);
	}
	getActivityByShopId(shop_id, callback) {
		_db.getActivityByShopId(shop_id, callback);
	}
}


class ShopActivityService {
	constructor() {
		this.__db = new DbProxy();
		this.__list = [];
		this.__last_load_time = 0;
		this.__should_reload = false;
	}

	addActivity(shop_id, title, image, callback) {
		let that = this;

		new Promise((resolve, reject) => {
			this.__db.addActivity(shop_id, image, title, (error, db_row) => {
				if (error != null) {
					reject(error);
				} else {
					resolve(db_row);
				}
			})
		}).then((db_row) => {
			if (db_row != null) {
				this.__should_reload = true;
				callback(db_row);
			} else {
				callback(null);
			}

		}).catch((error) => {
			logger.log("ERROR", "[ShopActivityService] sql error:", error);
			callback(null);
		})
	}


	getActivityList(callback) {
		if (callback == null || callback == undefined) {
			return;
		}
		let that = this;
		let now = moment().unix();

		new Promise((resolve, reject) => {
			if (now - this.__last_load_time < 5 * 60 && !this.__should_reload) {
				resolve(null);
			} else {
				this.__db.loadAllActivity((error, all_rows) => {
					//logger.log("INFO","load all activity from sql");
					if (error != null) {
						logger.log("ERROR", "sql error:", error);
						reject(error);
					} else {
						resolve(all_rows);
					}
				});
			}
		}).then((all_rows) => {
			//logger.log("INFO","load all activity from sql :",all_rows);
			if (all_rows != null) {
				this.__loadAllActivity(all_rows);
			}
			
			callback(this.__list);
		}).catch((error) => {
			logger.log("ERROR","error:",error);
			callback(null);
		});
	}

	getActivity(shop_id, callback) {

		this.__db.getActivityByShopId(shop_id, (error, row) => {
			let bean = new ShopActivityBean();
			if (error == null && row != null) {
				logger.log("INFO", 'row:', row);
				bean.initFromDb(row);
			}
			callback(error, bean);
		});
	}
	__loadAllActivity(all_rows) {
		this.__should_reload = false;
		this.__last_load_time = moment().unix();
		this.__list = []; // splice(0,length)
		if (all_rows != null) {

			for (let row of all_rows) {

				let bean = new ShopActivityBean();

				bean.initFromDb(row['dataValues']);

				this.__list.push(bean);

			}
		}


	}
}

module.exports = new ShopActivityService();