var iconv = require('iconv-lite');

function player(sock){

	this.socket = sock.ref();
	this.account = "";
	this.verify_code = "";
	this.telphone = "";
	this.userid = 0;
	//this.socket.setKeepAlive(true);
	this.socket.on('data', this.recvData);
    
    this.socket.on("close",this.closeConnection);
    this.socket.on("end",this.closeConnection);
    this.socket.on("error",this.errorFind);

}



player.prototype.recvData = function(data)
{
	var buffer = new Buffer(data);
	var packet_lenth = buffer.readInt32LE(0);
	var packet_type = buffer.readInt16LE(4);
	var packet_option = buffer.readInt8(6)


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
		try{
			var data_length = buffer.readInt16LE(7);
			var dataBuffer = buffer.slice(9);
			var dataBody = iconv.decode(dataBuffer, 'GBK');
			//console.log('LENGTH :' + data_length + 'and DATA ' +  ': ' + dataBody);

			messageDispatch(this,JSON.parse(dataBody));
			
		}catch(e){
			console.log(e);
		}
	}
}

player.prototype.errorFind = function()
{

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
	var logicName = data['Logic'];
	var methodName = data['Method'];

	var logic = require('./logic/' + logicName);

	
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

player.prototype.SetUserId = function(id){
	this.userid = id;
}

exports.createPlayer = function(sock)
{
	var p = new player(sock);
	g_playerlist.addPlayer(p);
	if(p.socket != null)
	{
		console.log("all player num is : " + g_playerlist.playerlist.length);
	}
	return p;
} 

exports.deletePlayer = function(sock)
{

}

