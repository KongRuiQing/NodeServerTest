
g_playerlist = {
	playerlist:[]
};

g_playerlist.findPlayerByAccount = function(account)
{
	for(var socket in this.playerlist){
		if(this.playerlist[socket]['account'] == account)
		{
			return this.playerlist[socket];
		}
	}
	return null;
};

g_playerlist.removePlayerByAccount = function(account)
{
	for(var socket in this.playerlist){
		if(this.playerlist[socket]['account'] == account){
			this.playerlist[socket] = null;
			this.playerlist.splice(socket);
		}
	}
}

g_playerlist.removePlayerbySocket = function(socket)
{
	if(this.playerlist[socket] != null){
		this.playerlist[socket] = null;
		this.playerlist.splice[socket];
	}
}

g_playerlist.findPlayerBySock = function(socket)
{
	return this.playerlist[socket];
};

g_playerlist.addPlayer = function(player)
{
	this.playerlist[player.socket] = player;
}

g_playerlist.setLogin = function(p,account)
{
	p.account = account;
};