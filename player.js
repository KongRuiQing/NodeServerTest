var iconv = require('iconv-lite');
var logger = require('./logger').logger();
var util = require('util');

// 引入 events 模块
var EventEmitter = require('events').EventEmitter;
// 创建 eventEmitter 对象

function player(sock){

	this.socket = sock;
	
	this.account = "";
	this.verify_code = "";
	this.telphone = "";
	this.uid = 0;
	this.name = "";
	this.signature = "";
	this.head = "";

	//this.socket.setKeepAlive(true);
	this.socket.on('data', recvData);

	this.socket.on("close",closeConnection);
	this.socket.on("end",closeConnection);
	this.socket.on("error",closeConnection);

	this.socket["player"] = this;

	this.on("send",this.sendData);
}

util.inherits(player,EventEmitter);

player.prototype.sendData = function(data,methodName){
	var ret = {
		'Method':methodName,
		'DataBody':data
	};
	console.log(ret);
	var s = JSON.stringify(ret);
	//console.log(s);
	var b = iconv.encode(s, 'GBK');
	
	var buff = new Buffer(b.length + 9);
	var retBuff = new Buffer(b);

	retBuff.copy(buff,9);

	buff.writeInt32LE(b.length + 9,0);
	buff.writeInt16LE(1,4);
	buff.writeInt8(1,6);
	buff.writeInt16LE(b.length,7);
	
	this.socket.write(buff);
}

player.prototype.sendPing = function(){
	var pingBuf = new Buffer(8);
	pingBuf.writeInt32LE(4,0);
	pingBuf.writeUInt16LE(0,4);
	pingBuf.writeInt16LE(0,6);
	this.socket.write(pingBuf);
}

function recvData(data)
{
	try{
		var buffer = new Buffer(data);

		var packet_lenth = buffer.readInt32LE(0);
		var packet_type = buffer.readInt16LE(4);
		var packet_option = buffer.readInt8(6);
		if(packet_type < 0)
		{
			//console.log("ping from client");
			if(this.player != null){
				this.player.sendPing();
			}
		}
		else
		{
			var data_length = buffer.readInt16LE(7);
			var dataBuffer = buffer.slice(9);
			var dataBody = iconv.decode(dataBuffer, 'GBK');
			if(this.player != null){
				this.player.messageDispatch(JSON.parse(dataBody));
			}
		}

	}catch(e){

		logger.error("ERROR",e);
	}
}

player.prototype.close = function(){
	player.uid = 0;
}

function closeConnection()
{
	if(this.player){
		var uid = this.player.uid;
		g_playerlist.removePlayerByUID(uid);
		this.player.close();
		this.player = null;
	}
}

player.prototype.messageDispatch = function(data){

	var logicName = data['Logic'];
	var methodName = data['Method'];
	var logic = require('./logic/' + logicName + ".js");

	if(typeof logic[methodName] === 'function'){

		logic[methodName](this,data['DataBody']);
	}
	
}

player.prototype.setTelphone = function(telphone){
	this.telphone = telphone;
}

player.prototype.setVerifyCode = function(verify_code)
{
	this.verify_code = verify_code;
}

player.prototype.checkVerifyCode = function(telphone,verify_code)
{
	if(this.telphone == telphone && this.verify_code == verify_code)
	{
		return true;
	}
	return false;
}

player.prototype.GetLongitude = function()
{
	return 0;
}

player.prototype.GetLatitude = function()
{
	return 0;
}

player.prototype.GetUserId = function()
{
	return this.uid;
}

function getUTC() {  
    var d = new Date();  
    return Date.UTC(d.getFullYear()  
        , d.getMonth()  
        , d.getDate()  
        , d.getHours()  
        , d.getMinutes()  
        , d.getSeconds()  
        , d.getMilliseconds());  
}  




player.prototype.SetUserLogin = function(player_info){
	this.guid = generate(10);

	this.uid = player_info['id'];
	this.name = player_info['name'];
	this.signature = player_info['signature'];
	this.head = player_info['head'];
}

exports.createPlayer = function(sock)
{
	var p = new player(sock);
	logger.log("PlAYER","create new player");
	return p;
} 

