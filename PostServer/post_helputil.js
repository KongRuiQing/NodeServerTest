'use strict';

var path=require('path');
const fs = require('fs');
var util = require('util');
var logger = require('../logger').logger();
let BASE_SHOP_IMAGE = "../../www/SaySystemWeb/Files";

function check_dir(dirs){
	for(var key in dirs){
		var dir_name = path.join(BASE_SHOP_IMAGE,dirs[key]);
		if(!fs.existsSync(dir_name)){
			fs.mkdirSync(dir_name);
			logger.log("INFO","create dir:" + dir_name);
		}
	}
}

function upload_file_to_json(files,map,result){

	
	for(var file_key in map){
		check_dir(map);
		if(file_key in files){
			let upload_file = files[file_key];
			let virtual_file_name = path.join(map[file_key],path.basename(upload_file.path));
			let newPath = path.join(BASE_SHOP_IMAGE,virtual_file_name);
			fs.renameSync(upload_file.path, newPath);
			result[file_key] = path.join('Files',virtual_file_name).replace(/\\/g,"\\\\");
			logger.log("INFO","upload_file:",file_key,"to : ", result[file_key]);
		}
	} 
}

exports.getAllUploadFile = function(files,map,result){
	upload_file_to_json(files,map,result);
}
