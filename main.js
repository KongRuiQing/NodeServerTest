var net = require('net');
var db = require('./mysqlproxy');
var iconv = require('iconv-lite');
var player = require("./player");
var http = require('http');
var path=require('path');
var url=require('url');
var query_server = require("./QueryServer/server");
var image_file_server = require("./ImageFileServer/Server");
var post_server = require("./PostServer/Server");
var down_server = require("./down/server");

require("./playerList");

var logger = require('./logger').logger();
var moment = require('moment');
//
//time = new Date(0);
//console.log(time);
//aa = time.getTime() + 100* 1000; // 100s* 1000
//console.log(aa);
//bb = new Date();
//bb.setTime(aa);

//console.log(moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'));
//console.log(moment("2012-02-01 01:00:01").add(1,'day').format('YYYY-MM-DD HH:mm:ss'));

var arr = []
arr[2] = 0;

console.log(arr);

var HOST = '';
var PORT = 9888;
var QUERY_PORT = 9889;
var IMAGE_FILE_PORT = 9890;
var POST_SERVER_PORT = 9891;
var DOWN_SERVER_PORT = 9892;

//var chatServer = net.createServer();

//chatServer.listen(PORT, HOST);

//logger.log('Server 监听 ' + HOST +':'+ PORT);

//chatServer.on('connection', function(sock) {
	//logger.log('connection','新的客户端: ' +sock.remoteAddress +':'+ sock.remotePort);
	//player.createPlayer(sock);
//});

query_server.start(HOST,QUERY_PORT);
image_file_server.start(HOST,IMAGE_FILE_PORT);
post_server.start(HOST,POST_SERVER_PORT);
down_server.start(HOST,DOWN_SERVER_PORT);