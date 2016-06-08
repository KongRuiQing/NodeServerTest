
g_playerlist = {
	playerlist:[]
};

g_playerlist.findPlayerByAccount = function(account)
{
	for(var p in this.playerlist){
		console.log("plyer in playerlist " + p + " " + this.playerlist[p].account);
		if(this.playerlist[p].account == account)
		{
			return this.playerlist[p];
		}
	}
	return null;
};

g_playerlist.removePlayerByAccount = function(account)
{
	for(var p in this.playerlist){
		if(this.playerlist[p].account == account)
		{
			var ret = {};
			ret.result = 2;
			this.playerlist[p].sendMessage(ret);
			this.playerlist[p].socket.unref();
			this.playerlist[p] = null;
			this.playerlist.splice(p);
			console.log("remove player by account");
		}
	}
}

g_playerlist.removePlayerbySocket = function(sock)
{
	for(var p in this.playerlist){
		if(this.playerlist[p].socket != null){
			var ip1 = this.playerlist[p].socket.remoteAddress;
			var port1 = this.playerlist[p].socket.remotePort;
			var ip2 = sock.remoteAddress;
			var port2 = sock.remotePort;
			if( ip1 == ip2 && port1 == port2){
				this.playerlist[p].socket.unref();
				this.playerlist[p] = null;
				this.playerlist.splice(p);
				console.log("remove player by socket");
			}
		}
		
	}
}

g_playerlist.findPlayerBySock = function(sock)
{
	for(var p in this.playerlist)
	{
		if(this.playerlist[p].socket != null){
			var ip1 = this.playerlist[p].socket.remoteAddress;
			var port1 = this.playerlist[p].socket.remotePort;
			var ip2 = sock.remoteAddress;
			var port2 = sock.remotePort;
			if( ip1 == ip2 && port1 == port2){
				//console.log("Find Sock");
				return this.playerlist[p];
			}
		}
		
	}
	return null;
};

g_playerlist.addPlayer = function(p)
{
	this.playerlist.push(p);
}

g_playerlist.setLogin = function(p,account)
{
	
	p.account = account;
};