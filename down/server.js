/***
 * @author flyingzl
 * @date 2010-11-27
 * 一个基于Node.js的简单文件服务器
 */

 var fs=require("fs"),
 http=require("http"),
 url=require("url"),
 path=require("path"),
 mime=require("./mime").mime,
 util=require('util'),
 logger = require('../logger').logger();
//www根目录
var root= "./down/apk/";

//显示文件内容
function showFile(file,req,res){
	fs.readFile(filename,'binary',function(err,file){
		var contentType=mime.lookupExtension(path.extname(filename));
		res.writeHead(200,{
			"Content-Type":contentType,
			"Content-Length":Buffer.byteLength(file,'binary'),
			"Server":"NodeJs("+process.version+")"
		});
		res.write(file,"binary");
		res.end();
	})
}


//如果文件找不到，显示404错误
function write404(req,res){
	var body="文件不存在:-(";
	res.writeHead(404,{
		"Content-Type":"text/html;charset=utf-8",
		"Content-Length":Buffer.byteLength(body,'utf8'),
		"Server":"NodeJs("+process.version+")"
	});
	res.write(body);
	res.end();
}

exports.start = function(host,port){

	http.createServer(function(req,res){

    //将url地址的中的%20替换为空格，不然Node.js找不到文件
    var pathname=url.parse(req.url).pathname.replace(/%20/g,' '),
    re=/(%[0-9A-Fa-f]{2}){3}/g;
    logger.log("DOWN_SERVER","down_pathname=" + pathname);
    //能够正确显示中文，将三字节的字符转换为utf-8编码
    pathname=pathname.replace(re,function(word){
    	var buffer=new Buffer(3),
    	array=word.split('%');
    	array.splice(0,1);
    	array.forEach(function(val,index){
    		buffer[index]=parseInt('0x'+val,16);
    	});
    	return buffer.toString('utf8');
    });
    if(pathname=='/'){

    }else{
    	filename=path.join(root,pathname);
    	fs.exists(filename,function(exists){
    		if(!exists){
    			util.error('找不到文件'+filename);
    			write404(req,res);
    		}else{
    			fs.stat(filename,function(err,stat){
    				if(stat.isFile()){
    					showFile(filename,req,res);
    				}else if(stat.isDirectory()){
    					listDirectory(filename,req,res);
    				}
    			});
    		}
    	});
    }
    
    
}).listen(port,host);
}


