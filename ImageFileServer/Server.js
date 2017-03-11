var http = require('http');
var path=require('path');
var url=require('url');
const fs = require('fs');
var formidable = require('formidable');
var util = require('util');
var logger = require('../logger').logger();
var server = null;
var mime = {
	//"css": "text/css",
	"gif": "image/gif",
	//"html": "text/html",
	"ico": "image/x-icon",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	//"js": "text/javascript",
	//"json": "application/json",
	//"pdf": "application/pdf",
	"png": "image/png",
	//"svg": "image/svg+xml",
	"swf": "application/x-shockwave-flash",
	"tiff": "image/tiff",
	//"txt": "text/plain",
	"wav": "audio/x-wav",
	"wma": "audio/x-ms-wma",
	"wmv": "video/x-ms-wmv",
	//"xml": "text/xml"
};
var form = new formidable.IncomingForm();

exports.start = function(Host,Port)
{
	form.uploadDir = "assets/upload/";
	form.maxFields = 1000;
	form.maxFieldsSize = 2 * 1024 * 1024;
	form.keepExtensions = true;
	server = http.createServer(function (request, response) {
		var pathname = url.parse(request.url).pathname;
		//logger.log("upload",pathname);
		if(pathname == '/upload'){
			if(request.method.toLowerCase() === 'post'){

				form.parse(request, function(err, fields, files) {
					
					if(err){
						logger.error("UPLOAD",err);
						return;
					}
					if(fields['dir'] == null || fields['dir'] == undefined){
						logger.error("UPLOAD","No Dir in upload");
					}
					logger.log("AAA",util.inspect(files));
					var filePath = '';
					if(files.tmpFile){
						filePath = files.tmpFile.path;
					} else {
						for(var key in files){
							if( files[key].path && filePath === ''){
								filePath = files[key].path;
								break;
							}
						}
					}
					var targetFile = path.join(fields['dir'],path.basename(filePath));
					var targetDirFile = path.join("../Image",targetFile);

					fs.rename(filePath, targetDirFile, function (err) {
						if (err) {
							response.writeHead(200, {'content-type': 'text/plain'});
							logger.error(err);
							var json_result = {
								'result':1,
								'bean' : fields['bean']
							};
							response.end(JSON.stringify(json_result));
						} else {
							response.writeHead(200, {'content-type': 'text/plain'});
							var json_result = {
								'result':0,
								'fileName':targetFile,
								'bean' : fields['bean']
							};
							response.end(JSON.stringify(json_result));
						}
					});
				});
			}
			
		}
		else{
			var fileName = path.normalize(pathname.replace(/\.\./g, ""));

			var realPath = path.join("../Image", fileName);
			
			var ext = path.extname(realPath);
			ext = ext ? ext.slice(1) : 'unknown';
			//logger.log("IMAGE","realPath : " + realPath);
			fs.exists(realPath, function (exists) {
				if (!exists) {

					logger.log("IMAGE","can find image in server");

					response.writeHead(404, {
						'Content-Type': 'text/plain'
					});
					response.write("This request URL " + pathname + " was not found on this server.");
					response.end();
					
				} else {
					var fs_state = fs.statSync(realPath);
					if(fs_state.isFile()){
						fs.readFile(realPath, "binary", function (err, file) {
							if (err) {
								console.log(err);
								response.writeHead(500, {
									'Content-Type': 'text/plain'
								});
								response.end(err)
							} else {
								var contentType = mime[ext] || "text/plain";
								response.writeHead(200, {'Content-Type': contentType});
								response.write(file, "binary");
								response.end();
							}
						});
					}else{
						response.writeHead(404, {
							'Content-Type': 'text/plain'
						});
						response.write("This request URL " + pathname + " was not found on this server.");
						response.end();
					}
					
					
				}
			});
		}
		
	});
	server.listen(Port,Host);
	logger.log("START","Image Server runing at port: " + Port + ".");
}