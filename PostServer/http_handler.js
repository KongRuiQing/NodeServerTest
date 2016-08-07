const fs = require('fs');
var util = require('util');
var logger = require('../logger').logger();
var db = require("../mysqlproxy");

exports.become_seller = function(fields,files,callback){
	logger.log("become_seller",util.inspect(fields));
	logger.log("become_seller",util.inspect(files));

	var request_json = JSON.parse(fields['fields']);
	var uploadFile = {
		"shop_image":"shop/image/",
		"ad":"shop/ad"
	};
	for(var file_key in files){
		var File = files[file_key];
		var virtual_file_name = path.join("upload",uploadFile[file_key],path.basename(filePath))
		var newPath = path.join("assets",virtual_file_name);
		fs.renameSync(File.path, newPath);
		request_json[file_key] = path.join(virtual_file_name);
	}

	db.InsertBecomeSeller(request_json,function(success,db_result){
		callback(true,db_result)
	});
	
}

exports.new_feed = function(fields,files,callback){
	
};