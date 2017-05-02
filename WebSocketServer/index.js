'use strict';

const WebSocket = require('ws');

const handler_route = require('./route.js');

console.log("load WebSocket.index.js");

function WebSocketApp(HOST,PORT){
	this.clients = new Map();

	this.wss = new WebSocket.Server({
		port: PORT,
	});
	this.wss.on('connection',function(websocket){
		websocket.on('message',handle_recvMessage);
		websocket.on('error',handler_Error);
		websocket.on('close',handler_close);
		websocket.on('ping',handler_ping);
		
	});
}

function handler_Error(error){
	console.log(error);
}

function handler_ping(){
	this.pong('pong');
}
function handler_close(code,reason){
	console.log('code:' ,code,'reason:',reason);
	let uid = this.uid;
	console.log('uid:',uid,'onClose');
	app.removeClient(uid);
}

WebSocketApp.prototype.sendMessage = function(uid,cmd,sendData) {
	console.log('uid:',uid,'sendData',JSON.stringify(sendData));
	let client = this.clients.get(uid);
	if(client != null){
		client.send(JSON.stringify({
			'cmd' : cmd,
			'data' : sendData,
		}),function(err){
			
		});
	}else{
		console.log("client == null");
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

WebSocketApp.prototype.removeClient = function(uid){
	if(this.clients.has(uid)){
		
		this.clients.delete(uid);
	}
}



function handle_recvMessage(data){

	console.log('recv:',data);

	let recvData = JSON.parse(data);
	let cmd = recvData['cmd'];
	let recvMsg = recvData['data'];

	if(cmd != undefined && cmd != null){
		handler_route[cmd](app,this,recvMsg);
	}else{
		//handler_route['error'](this);
	}
}

WebSocketApp.prototype.register = function(uid,socket){
	if(this.clients.has(uid)){
		console.log('error','uid is repeated', uid);
		//this.clients.delete(uid);
	}else{
		this.clients.set(uid,socket);
	}
}

var app = null;

exports.start = function(HOST,PORT){

	if(app == null){
		app = new WebSocketApp(HOST,PORT);
	}
}

exports.sendMessage = function(uid,cmd,sendData){
	if(app != null){
		app.sendMessage(uid,cmd,sendData);
	}else{
		console.log('app is null');
	}
}
exports.broadcast = function(cmd,sendData){
	if(app != null){
		app.broadcast(cmd,sendData);
	}else{
		console.log('app is null');
	}
}