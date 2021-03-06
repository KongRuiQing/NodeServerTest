var moment = require('moment');

var EARTH_RADIUS = 6378137.0;    //单位M
var PI = 3.14159;

function getRad(d){
	return d*PI/180.0;
}

exports.getCurrentTime = function(){
	return moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
}


exports.getFlatternDistance = function(){// lng0 lat lng lat
	
	if(arguments.length != 4){
		console.error("getFlatternDistance error");
		if(args){
			
		}
	}
	
	let lat1 = arguments[1];
	let lng1 = arguments[0];
	let lat2 = arguments[3];
	let lng2 = arguments[2];

	if(lat1 == lat2 && lng1 == lng2){
		return 1
	}
	
	var f = getRad((lat1 + lat2)/2);
	var g = getRad((lat1 - lat2)/2);
	var l = getRad((lng1 - lng2)/2);
	
	var sg = Math.sin(g);
	var sl = Math.sin(l);
	var sf = Math.sin(f);

	var s,c,w,r,d,h1,h2;
	var a = EARTH_RADIUS;
	var fl = 1/298.257;

	sg = sg*sg;
	sl = sl*sl;
	sf = sf*sf;

	s = sg*(1-sl) + (1-sf)*sl;
	c = (1-sg)*(1-sl) + sf*sl;
	if(c == 0){
		return 1;
	}
	if(s == 0){
		return 1;
	}
	w = Math.atan(Math.sqrt(s/c));
	if(w == 0){
		return 1;
	}
	r = Math.sqrt(s*c)/w;
	d = 2*w*a;
	h1 = (3*r -1)/2/c;
	h2 = (3*r +1)/2/s;
	var dis = d*(1 + fl*(h1*sf*(1-sg) - h2*(1-sf)*sg));
	
	return Math.max(1,dis);
}

exports.randVertifyCode = function(){
	return "";
}

exports.checkIsNumber = function(num){
	if(typeof(num) == 'number' && !isNaN(num)){
		return true;
	}
	return false;
}