console.log('Start Server');
var net = require('net');
var db = require('./mysqlproxy');
var iconv = require('iconv-lite');

var http = require('http');
var path = require('path');
var url = require('url');
var query_server = require("./QueryServer/server");
var image_file_server = require("./ImageFileServer/Server");
var post_server = require("./PostServer/Server");
var resutapi_server = require("./RestfulApi");
var webSocket = require("./WebSocketServer");
var logger = require('./logger').logger();
var moment = require('moment');

require("./Logic/load.js");

//
//time = new Date(0);
//console.log(time);
//aa = time.getTime() + 100* 1000; // 100s* 1000
//console.log(aa);
//bb = new Date();
//bb.setTime(aa);

//console.log(moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'));
//console.log(moment("2012-02-01 01:00:01").add(1,'day').format('YYYY-MM-DD HH:mm:ss'));

var db_seq = require("./Db_sequelize");
//db_seq.updateUserLogin(1,2,3);
//db_seq.TestFindOrCreate("1");
//db_seq.insertRequestBeSeller({'name' : '888','category' : [1,2,3],},function(err,db_row){console.log(db_row);});
//return;
//var FindUtil = require("./FindUtil.js");
//FindUtil.getFlatternDistance(11,11,121);


var HOST = '';
var PORT = 9888;
var QUERY_PORT = 9889;
var IMAGE_FILE_PORT = 9890;
var POST_SERVER_PORT = 9891;
var WEB_SOCKET_SERVER = 9892;
var HTTP_RESTFUL_API_PORT = 12000;

//var chatServer = net.createServer();

//chatServer.listen(PORT, HOST);

//logger.log('Server 监听 ' + HOST +':'+ PORT);

//chatServer.on('connection', function(sock) {
//logger.log('connection','新的客户端: ' +sock.remoteAddress +':'+ sock.remotePort);
//player.createPlayer(sock);
//});


//

argv = process.argv;


if (argv.length >= 3) {
	cmd = argv[2]

	if (cmd == "add_account") {
		
	}
}
else
{
	query_server.start(HOST, QUERY_PORT);
	image_file_server.start(HOST, IMAGE_FILE_PORT);
	post_server.start(HOST, POST_SERVER_PORT);
	resutapi_server.start(HOST, HTTP_RESTFUL_API_PORT);
	webSocket.start(HOST, WEB_SOCKET_SERVER);
}


//
