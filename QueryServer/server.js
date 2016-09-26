var http = require('http');
var url=require('url');
var http_handler = require("./http_handler");
var logger = require('../logger').logger();
var server =null;

var handle_http = {};
handle_http['/area'] = http_handler.getAreaMenu;
handle_http['/shop_list'] = http_handler.getShopList;
handle_http['/shop_detail'] = http_handler.getShopDetail;
handle_http['/ad_image'] = http_handler.getAdImage;
handle_http['/shop_spread'] = http_handler.getShopSpread;
handle_http['/exchange_item_list'] = http_handler.getExchangeItemList;
handle_http['/exchange_item_detail'] = http_handler.getExchangeItemDetail;
handle_http['/activity_list'] = http_handler.getActivityList;
handle_http['/near_shop'] = http_handler.getNearShopList;
handle_http['/shop_item_detail'] = http_handler.getShopItemDetail;
handle_http['/my_favorites_item'] = http_handler.getMyFavoritesItems;
handle_http['/check_version'] = http_handler.getApkVersion;
var http_header = {};

http_header[200] = "text/html";
http_header[500] = 'text/plain';
http_header[600] = 'text/plain';

function handle_server(request,response){

	var request_url = url.parse(request.url,true);
	var pathname = request_url.pathname;
	var headers = request.headers;
	logger.log("QUERY_SERVER","pathname" + pathname);
	
	if (typeof handle_http[pathname] === 'function'){
		console.log(pathname);
		handle_http[pathname](request_url.query,function(error_code,content){

			if(error_code == 0){

				response.writeHead(200, {
					'Content-Type': http_header[200]
				});
				response.write(JSON.stringify(content));
			}else
			{
				response.writeHead(500, {
					'Content-Type': http_header[500]
				});
				var json_content = {};
				json_content['error_code'] = error_code;
				response.write(JSON.stringify(json_content));
				
			}
			response.end();
		}) 
	}else{
		console.log("err");
		response.writeHead(600, {
			'Content-Type': http_header[600]
		});
		response.end();
	}
}

exports.start = function(Host,Port)
{
	server = http.createServer(handle_server);
	server.listen(Port,Host);
}