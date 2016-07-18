var iconv = require('iconv-lite');
var logger = require('./logger').logger();
var util = require('util');
function player(sock){

	this.socket = sock;
	this.account = "";
	this.verify_code = "";
	this.telphone = "";
	this.userid = 0;
	this.name = "";
	this.signature = "";
	this.head = "";

	//this.socket.setKeepAlive(true);
	this.socket.on('data', this.recvData);

	this.socket.on("close",this.closeConnection);
	this.socket.on("end",this.closeConnection);
	this.socket.on("error",this.errorFind);

}



player.prototype.recvData = function(data)
{
	try{
		var buffer = new Buffer(data);

		var packet_lenth = buffer.readInt32LE(0);
		var packet_type = buffer.readInt16LE(4);
		var packet_option = buffer.readInt8(6);
		if(packet_type < 0)
		{
			//console.log("ping from client");
			var  pingBuf = new Buffer(8);
			pingBuf.writeInt32LE(4,0);
			pingBuf.writeUInt16LE(0,4);
			pingBuf.writeInt16LE(0,6);

			this.write(pingBuf);
		}
		else
		{
			var data_length = buffer.readInt16LE(7);
			var dataBuffer = buffer.slice(9);
			var dataBody = iconv.decode(dataBuffer, 'GBK');
			messageDispatch(this,JSON.parse(dataBody));
		}

	}catch(e){

		logger.error("ERROR",e);
	}
}

player.prototype.errorFind = function()
{
	console.log("error");
	var p = g_playerlist.findPlayerBySock(this);
	if(p != null){
		g_playerlist.removePlayerbySocket(this);
	}
}

player.prototype.closeConnection = function(data)
{
	console.log("close");
	var p = g_playerlist.findPlayerBySock(this);
	if(p != null)
	{
		//console.log("find player to close");
		g_playerlist.removePlayerbySocket(this);
	}
}

function messageDispatch(sock,data){

	var player = g_playerlist.findPlayerBySock(sock);
	player.dispatchMessage(data);
	
}

function callback(p,data,method)
{
	var ret = {
		Method:method,
		DataBody:data
	};
	p.sendMessage(ret);
}

player.prototype.dispatchMessage = function(data)
{
	console.log(util.inspect(data));

	var logicName = data['Logic'];
	var methodName = data['Method'];
	console.log(typeof logicName);
	console.log('./logic/' + logicName + ".js");
	var logic = require('./logic/' + logicName + ".js");

	logic[methodName](data['DataBody'],this,callback);
}



player.prototype.sendMessage = function(ret)
{
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
	return this.userid;
}

player.prototype.SetUserLogin = function(player_info){
	this.userid = player_info['id'];
	this.name = player_info['name'];
	this.signature = player_info['signature'];
	this.head = player_info['head'];
}

player.prototype.SendAgreeBeFriend = function(uid){

	var ret = {
		"Method":"agree_be_friend",
		"DataBody":{
			"method":"accept",
			"friend_id":uid,
			"friend_info":{
				"id":uid,
				"name" : this.name,
				"signature" : this.signature,
				"head" : this.head
			}
		}
	};
	sendMessage(ret);
};

exports.createPlayer = function(sock)
{
	var p = new player(sock);
	g_playerlist.addPlayer(p);
	logger.log("PlAYER","create new player");
	return p;
} 

exports.deletePlayer = function(sock)
{

}

