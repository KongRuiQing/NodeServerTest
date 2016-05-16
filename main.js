var net = require('net');
var db = require('./mysqlproxy');
var iconv = require('iconv-lite');
var player = require("./player");

require("./playerList");

var HOST = '192.168.0.120';
var PORT = 9888;


var findServer = net.createServer();

findServer.listen(PORT, HOST);
console.log('Server 监听 ' + HOST +':'+ PORT);

findServer.on('connection', function(sock) {
    console.log('开启服务器: ' +sock.remoteAddress +':'+ sock.remotePort);
    
    player.createPlayer(sock);
});