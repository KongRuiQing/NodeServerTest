'use strict';

const WebSocket = require('ws');
var util = require("util");
const handler_route = require('./route.js');
var logger = require('../logger').logger();
console.log("load WebSocket.index.js");

function WebSocketApp(HOST,PORT){
	this.clients = new Map();
	this.login_client = new Map();

	this.wss = new WebSocket.Server({
		port: PORT,
	});
	this.wss.on('connection',function(websocket){
		websocket.on('message',handle_recvMessage);
		websocket.on('error',handler_Error);
		websocket.on('close',handler_close);
		websocket.on('ping',handler_ping);
		websocket.on('open',handle_open);
	});
}

function handle_open(){

}

function handler_Error(error){
	logger.log("ERROR",'[WebSocketApp] error:',util.inspect(error));
}

function handler_ping(){
	this.pong('pong');
}
function handler_close(code,reason){
	console.log('code:' ,code,'reason:',reason);
	
	app.removeClient(this);
}

WebSocketApp.prototype.sendMessage = function(uid,cmd,sendData) {
	let nid = this.login_client.get(uid);
	logger.log("INFO",`uid:${uid} find nid:${nid}`);
	if(nid != null){
		let client = this.clients.get(nid);
		if(client != null){
			client.send(JSON.stringify({
				'cmd' : cmd,
				'data' : sendData,
			}),function(err){

			});
		}else{
			console.log("client == null");
		}
	}else{
		logger.log('WARN',`uid:${uid} can't register this app`);
	}
	
};

WebSocketApp.prototype.broadcast = function(cmd,sendData){
	this.clients.forEach(function(client,key){
		client.send(JSON.stringify({
			'cmd' : cmd,
			'data' : sendData,
		}));
	});
}

function handle_sendResponse(error){
	if(typeof error === 'string'){
		if(error.length != 0){
			logger.log('ERROR','[WebSocketApp][handle_sendResponse]','error:',error);
		}
	}else{
		if(error != null){
			logger.log('ERROR','[WebSocketApp][handle_sendResponse]','error:',util.inspect(error));
		}
	}
}

WebSocketApp.prototype.reply = function(client,cmd,responseData){

	setImmediate(()=>{

		logger.log("INFO",`uid:${client.uid} nid:${client.nid} reply-> cmd : ${cmd},responseData`,responseData);
		if(client != null){
			client.send(JSON.stringify({
				'cmd' : cmd + "_rsp",
				'data' : responseData,
			},handle_sendResponse));
		}
		
	});

}

WebSocketApp.prototype.removeClient = function(socket){
	let nid = socket.nid;
	let uid = socket.uid;
	if(this.clients.has(nid)){
		this.clients.delete(nid);

	}
	if(uid != null || uid != undefined){
		if(this.login_client.has(uid)){
			this.login_client.delete(uid);
		}
	}
	console.log("nid:",nid,'uid:',uid,'close');
}



function handle_recvMessage(message){

	console.log('recv:',message);

	let recvData = JSON.parse(message);
	let cmd = recvData['cmd'];
	let recvMsg = recvData['data'];

	if(cmd != undefined && cmd != null){
		if(cmd in handler_route){
			handler_route[cmd](app,this,recvMsg);
		}else{
			
		}
		
	}else{
		//handler_route['error'](this);
	}
}

WebSocketApp.prototype.register = function(socket){
	let nid = socket.nid;
	console.log('nid:',nid,'is connection');
	if(this.clients.has(nid)){
		console.log('error','nid is repeated', nid);
	}else{
		this.clients.set(nid,socket);
	}
}

WebSocketApp.prototype.login = function(uid,nid){
	logger.log("INFO",`uid:${uid} bind nid:${nid}`);
	if(this.clients.has(nid)){
		this.login_client.set(uid,nid);
	}
}

WebSocketApp.prototype.logout = function(socket){
	if(('uid' in socket) && socket.uid > 0){
		let uid = socket.uid;
		socket.uid = 0;
		if(this.login_client.has(uid)){
			this.login_client.delete(uid);
		}
	}
}

var app = null;

exports.start = function(HOST,PORT){

	if(app == null){
		app = new WebSocketApp(HOST,PORT);
	}
}

exports.sendMessage = function(uid,cmd,sendData){
	logger.log("INFO",`${uid} send ${cmd} body:`, sendData);
	if(app != null){
		app.sendMessage(uid,cmd,sendData);
	}else{
		logger.log("WARN",'WebSocketApp is null');
	}
}
exports.broadcast = function(cmd,sendData){
	if(app != null){
		app.broadcast(cmd,sendData);
	}else{
		console.log('app is null');
	}
}
exports.broadcastGroup = function(cmd,group,sendData){

}