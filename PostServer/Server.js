var http = require('http');
var path=require('path');
var url=require('url');
const fs = require('fs');
var formidable = require('formidable');
var util = require('util');
var logger = require('../logger').logger();
var http_handler = require("./http_handler");

var server = null;


var handle_http = {};
handle_http['/become_seller'] = http_handler.becomeSeller;
handle_http['/login'] = http_handler.login;
handle_http['/register'] = http_handler.register;
handle_http['/change_sex'] = http_handler.changeSex;
handle_http['/change_nickname'] = http_handler.changeNickName;
handle_http['/change_birthday'] = http_handler.changeBirthday;
handle_http['/change_sign'] = http_handler.changeSign;
handle_http['/attention_shop'] = http_handler.attentionShop;
handle_http['/add_favorites'] = http_handler.addToFavorites;
handle_http['/change_user_info'] = http_handler.changeUserInfo;
handle_http['/add_shop_item'] = http_handler.addShopItem;
handle_http['/save_shop_basic_info'] = http_handler.saveShopBasicInfo;
handle_http['/remove_favorites_item'] = http_handler.removeFavoritesItem;
handle_http['/renewal'] = http_handler.renewal;
handle_http['/add_shop_activity'] = http_handler.addShopActivity;

exports.start = function(Host,Port)
{
	
	server = http.createServer(function (request, response) {
		var pathname = url.parse(request.url).pathname;
		
		if(request.method.toLowerCase() === 'post'){
			var form = new formidable.IncomingForm();
			form.uploadDir = "assets/upload/";
			form.maxFields = 1000;
			form.maxFieldsSize = 2 * 1024 * 1024;
			form.keepExtensions = true;

			logger.log("POST SERVER",pathname);

			form.parse(request, function(err, fields, files) {
				if(err){
					logger.error("UPLOAD",err);
					response.end("123");
					return;
				}

				try{
					handle_http[pathname](fields,files,function(success,json_result){
						response.writeHead(200, {'content-type': 'text/plain'});
						response.end(JSON.stringify(json_result));
					});
				}catch(err){
					logger.error(err);
				}
			});

			
			
		}
	});
	server.listen(Port,Host);
	logger.log("START","POST Server runing at port: " + Port + ".");
}