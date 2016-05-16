var mysql = require('mysql');
var connection = mysql.createConnection({
	host     : '115.159.67.251',
	user     : 'eplus-find',
	password : 'eplus-find',
	port:'3306',
	database : 'find'
});


connection.connect(function(err){
	if(err)
	{
		console.log('[sql] - :' + err);
		return;
	}
	console.log('[sql connect]')
});


exports.query = function(sql)
{
	connection.query(sql,function(err,row,fields){
		if(err)
		{
			console.log('[sql] - :' + err);
			return;
		}
		
	});
}

exports.checkLogin = function(account,password,cb){

	var sql = 'select * from userlogin where Account = "' + account + '" and Password = "' + password +'"';
	
	connection.query(sql,function(err,row,fields){
		
		if(err)
		{
			console.log("db Error : " + err);
			cb(false);
			return;
		}
		
		if(row.length == 1)
		{
			cb(true);
		}
		else
		{
			cb(false)
		}
	});
}

exports.VerifyTelphone = function(telphone,cb)
{
	var sql  = 'select * from userlogin where Account = "' + telphone + '"';
	connection.query(sql,function(err,row,fields){
		if(err)
		{
			console.log("[db] query error with sql " + sql);
			cb(1000);
			return;
		}
		if(row.length > 0)
		{
			cb(1001)
			return;
		}
		else
		{
			cb(0);
			return;
		}
	}) ;
}

exports.Register = function(telphone,password,cb)
{
	connection.query('CALL register('+telphone+ ','+password + ',@a,@b' +')', function(err, result) {  
		if (err){
			console.log(err);
			cb(false,0);
			return;
		}
		var db_ret = result[0][0];
		if(db_ret.result == 1)
		{
			cb(true,result[0].finduid);
		}
		else
		{
			db(false,db_ret.result);
		}
		
		//console.log(result[0]);
	}); 
}

exports.GetShopList = function(pageIndex,pageSize,longitude,latitude,cb)
{
	connection.query("CALL p_get_shop_list(?,?,?,?,?,?)",[pageIndex,pageSize,"name,beg,end,img,gold,deal,longitude,latitude","shop",longitude,latitude],function(err,result){
		if(err){
			console.log(err);
			cb(false,null);
			return;
		}
		
		var db_ret = result[0];
		var ret = [];
		for(var i in db_ret){
			var row = db_ret[i];
			row.longitude = 0;
			row.latitude = 0;
			ret.push(row);
		}
		cb(true,ret);
	});
}

exports.close = function()
{
	connection.end();
}

