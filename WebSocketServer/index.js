'use strict';

const WebSocket = require('ws');
var util = require("util");
var events = require('events');
const handler_route = require('./route.js');
var logger = require('../logger').logger();


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
		websocket.on('open',handle_open);
	});
	events.EventEmitter.call(this);
}

util.inherits(WebSocketApp, events.EventEmitter);

function handle_open(){

}

function handler_Error(error){
	logger.log("ERROR",'[WebSocketApp][handler_Error] error:',util.inspect(error));
}

function handler_ping(){
	this.pong('pong');
}
function handler_close(code,reason){
	console.log('code:' ,code,'reason:',reason);
	if(app != null){
		app.removeClient(this);
	}
}

WebSocketApp.prototype.sendMessage = function(nid,cmd,sendData) {
	if(!this.clients.has(nid)){
		logger.log("ERROR",`${nid} is not exist clients, cmd: ${cmd}`);
		return;
	}
	let that = this;
	setImmediate(()=>{
		let client = this.clients.get(nid);
		if(client != null){
			client.send(JSON.stringify({
				'cmd' : cmd,
				'data' : sendData,
			}),function(err){
				if(!err){
					that.emit(nid+"_"+ cmd,err);
				}else{
					logger.log("ERROR","[WebSocketApp][sendMessage] error :",err);
				}
			});
		}
	})
	
};

WebSocketApp.prototype.broadcast = function(cmd,sendData){
	this.clients.forEach((client)=>{
		client.send(JSON.stringify({
			'cmd' : cmd,
			'data' : sendData,
		}));
	});
}


WebSocketApp.prototype.removeClient = function(socket){
	let nid = socket.nid;
	
	if(this.clients.has(nid)){
		this.clients.delete(nid);
	}
}

WebSocketApp.prototype.register = function(nid,socket){
	this.clients.set(nid,socket);
}

WebSocketApp.prototype.reply = function(socket,cmd,replyData){

	logger.log("INFO","[WebSocketApp] reply:",`cmd : ${cmd} replyData:`,replyData);
	setImmediate(()=>{
		if(socket != null){
			socket.send(JSON.stringify({
				'cmd' : cmd,
				'data' : replyData,
			}),(err)=>{
				if(err != null){
					logger.log("ERROR",'[WebSocketApp][reply]  error: ',err);
				}
			});
		}
	});
}

function handle_recvMessage(message){
	logger.log("INFO","[WebSocketApp] recvMsg:",message);

	let recvData = JSON.parse(message);
	let cmd = recvData['cmd'];
	let recvMsg = recvData['data'];

	if(cmd != undefined && cmd != null){
		if(cmd in handler_route){
			handler_route[cmd](app,this,recvMsg);
		}else{
			handler_route['error'](app,this,null);
		}
		
	}else{
		handler_route['error'](app,this,null);
	}
}

var app = null;

exports.start = function(HOST,PORT){

	if(app == null){
		app = new WebSocketApp(HOST,PORT);
		app.on('register',(nid,socket)=>{
			app.register(nid,socket);
		});
	}
}

exports.sendMessage = function(nid,cmd,sendData){
	
	if(app != null){
		app.sendMessage(nid,cmd,sendData);
	}else{
		logger.log("WARN",'WebSocketApp is null');
	}
}


