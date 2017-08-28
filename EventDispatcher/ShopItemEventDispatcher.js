const EventEmitter = require('events');
var logger = require("../logger.js").logger();

logger.log("INFO","load ShopItemEventDispatcher");

class ShopItemEventDispatcher extends EventEmitter{
	constructor(){
		super();
	}

	bindEvent(event_name,callback){
		logger.log("INFO","bindEvent",event_name);
		this.on(event_name,callback);
	}
	fireEvent(event_name,event_obj){
		
		this.emit(event_name,event_obj);
	}
}

module.exports = new ShopItemEventDispatcher();;