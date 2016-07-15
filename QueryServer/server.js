var http = require('http');
var url=require('url');
var http_handler = require("./http_handler");
var logger = require('../logger').logger();
var server =null;

var handle_http = {};
handle_http['/area'] = http_handler.getAreaMenu;
handle_http['/shop'] = http_handler.getShop;
handle_http['/shop_detail'] = http_handler.getShopDetail;
handle_http['/ad_image'] = http_handler.getAdImage;
handle_http['/shop_spread'] = http_handler.getShopSpread;
exports.start = function(Host,Port)
{
	server = http.createServer(function(request, response){

	var request_url = url.parse(request.url,true);

	var pathname = request_url.pathname;
	logger.log("QUERY","Request for "+pathname+" received.");   

	if (typeof handle_http[pathname] === 'function'){
		logger.log("QUERY",request_url.query);
		handle_http[pathname](request_url.query,function(error_code,content){

			if(error_code == 0){
				var contentType = "text/html";
				response.writeHead(200, {
					'Content-Type': contentType
				});
				response.write(JSON.stringify(content));
			}else
			{
				response.writeHead(500, {
					'Content-Type': 'text/plain'
				});
				
			}
			response.end();
		}) 
	}else
	{

		response.writeHead(500, {
			'Content-Type': 'text/plain'
		});
		response.end();
	}
	
});
server.listen(Port,Host);
}