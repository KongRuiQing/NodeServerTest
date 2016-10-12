
var util = require('util');

g_shop_cache = {
	'dict' : {},
	'item_property_name' : {},
	'shop_item_property' : {},
	'shop_items' : {},
	'show_items' : [],
	'activity_list' : []
};

exports.InitFromDb = function(
	shop_list,
	shop_comment,
	shop_item,
	shop_item_property,
	shop_item_property_config,
	shop_attention,
	activity_list){
	
	g_shop_cache['dict'] = {};
	g_shop_cache['max_shop_id'] = 0;

	for(var i in shop_list){
		var shop_id = shop_list[i]['Id'];
		
		g_shop_cache['dict'][shop_id] = {
			'name' : shop_list[i]['name'],
			'address' : shop_list[i]['address'],
			'city_no' : parseInt(shop_list[i]['city_no']),
			'area_code' : parseInt(shop_list[i]['area_code']),
			'zone': parseInt(shop_list[i]['zone']),
			'beg' : parseInt(shop_list[i]['beg']),
			'end' : parseInt(shop_list[i]['end']),
			'image' : shop_list[i]['image'],
			'telephone' : shop_list[i]['telephone'],
			'longitude': parseFloat(shop_list[i]['longitude']),
			'latitude': parseFloat(shop_list[i]['latitude']),
			'image_in_near' : shop_list[i]['near_image'],
			'category_code' : shop_list[i]['category_code'] || 0,
			'qualification' : shop_list[i]['qualification'],
			'qq' : shop_list[i]['qq'],
			'wx' : shop_list[i]['wx'],
			'email' : shop_list[i]['email'],
			'business' : shop_list[i]['business'],
			'attention' : [],
			'comment' : [],
			'shop_item_ids' : [],
			'image_in_attention' : shop_list[i]['image_in_attention'],
			'state' : shop_list[i]['state']
		};
		g_shop_cache['max_shop_id'] = Math.max(parseInt(shop_id),g_shop_cache['max_shop_id']);
	}

	for(var i in shop_comment){
		var shop_id = shop_comment[i]['shop_id'];
		var shop_info = g_shop_cache['dict'][shop_id];
		var comment = shop_comment[i];
		
		if(shop_info != null){
			shop_info['comment'].push({
				'uid' : comment['uid'],
				'comment':comment['comment'],
				'datetime' : comment['datetime'],
				'remark' : comment['remark']
			})
		}
	}
	for(var i in shop_item){
		var item = shop_item[i];
		var shop_id = item['shop_id'];

		var shop_info = g_shop_cache['dict'][shop_id];
		
		if(shop_info != null){
			shop_info['shop_item_ids'].push(item['id']);

			g_shop_cache['shop_items'][item['id']] = {
				'id': item['id'],
				'shop_id' : shop_id,
				'image' : item['image'],
				'name' : item['name'],
				'price' : item['price'],
				'show_price' : item['show_price'],
				'images' : [item['image1'],
				item['image2'],
				item['image3'],
				item['image4'],
				item['image5'],
				item['image6'],
				item['image7'],
				item['image8']
				],
				'is_show_main' : parseInt(item['is_show']),
				'favorites_image' : item['favorites_image'],
			};
		}
		if(parseInt(item['is_show']) == 1){
			g_shop_cache['show_items'].push(item['id']);
		}


	}
	

	for(var i in shop_item_property_config){
		g_shop_cache['item_property_name'][shop_item_property_config[i]['property_type']] = {
			'name':shop_item_property_config[i]['property_name'],
			'category' : shop_item_property_config[i]['category']
		}
	}
	

	for(var i in shop_item_property){

		if(g_shop_cache['shop_item_property'][shop_item_property[i]['item_id']] == null){
			g_shop_cache['shop_item_property'][shop_item_property[i]['item_id']] = [];
		}

		g_shop_cache['shop_item_property'][shop_item_property[i]['item_id']].push({
			'id' : shop_item_property[i]['id'],
			'property_type' : shop_item_property[i]['property_type'],
			'property_value' : shop_item_property[i]['property_value'],
			'is_show' : shop_item_property[i]['is_show']
		});
	}

	for(var i in shop_attention){
		var shop_id = shop_attention[i]['shop_id'];
		if(g_shop_cache['dict'][shop_id] != null){
			g_shop_cache['dict'][shop_id]['attention'].push(shop_attention[i]['uid']);
		}
		
	}

	for(var i in activity_list){
		
		g_shop_cache['activity_list'].push({
			'name':activity_list[i]['name'],
			'discard':activity_list[i]['discard'],
			'image':activity_list[i]['image'],
			'id':activity_list[i]['id']
		});
	}
}

exports.getShopList = function(uid,city_no,area_code,category,page,page_size){
	var all_list = [];
	
	for(var i in g_shop_cache['dict']){

		var shop_info = g_shop_cache['dict'][i];

		if(shop_info['city_no'] == city_no && 
			(area_code == shop_info['area_code'] || area_code == 0) && 
			(category == shop_info['category'] || category == 0)){

			
			all_list.push({
				'shop_name' : shop_info['name'],
				'shop_address' : shop_info['address'],
				'shop_image' : shop_info['image'],
				'long' : shop_info['longitude'],
				'late' : shop_info['latitude'],
				'shop_attention' : shop_info['attention'],
				'attention_num' : shop_info['attention'].length,
				'is_attention' : uid in shop_info['attention'],
				"id" : parseInt(i)
			});
		}
	}
	if(page * page_size >= all_list.length){
		return {
			'list':all_list.slice((page - 1) * page_size, all_list.length - 1),
			'count' : all_list.length
		};
	}
	else{
		return {
			'list':all_list.slice((page - 1) * page_size, page * page_size - 1),
			'count' : all_list.length
		};
	}
}

var EARTH_RADIUS = 6378137.0;    //单位M
var PI = Math.PI;

function getRad(d){
	return d*PI/180.0;
}


function getFlatternDistance(lat1,lng1,lat2,lng2){
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

	w = Math.atan(Math.sqrt(s/c));
	r = Math.sqrt(s*c)/w;
	d = 2*w*a;
	h1 = (3*r -1)/2/c;
	h2 = (3*r +1)/2/s;

	return d*(1 + fl*(h1*sf*(1-sg) - h2*(1-sf)*sg));
}


exports.GetNearShopList = function(type,long,late,page,size){

	var int_type = parseInt(type);
	var inRange = [];
	if(int_type > 0){
		if(int_type % 1000 == 0){
			inRange = [int_type,int_type + 999];
		}else{
			inRange = [int_type,int_type];
		}
	}else{
		inRange = [0,100000000];
	}
	
	var all_list = [];
	for(var i in g_shop_cache['dict']){
		var shop_info = g_shop_cache['dict'][i];

		if(shop_info['category'] <= inRange[1] && shop_info['category'] >= inRange[0]){
			
			all_list.push({
				'shop_name' : shop_info['name'],
				'shop_address' : shop_info['address'],
				'shop_image' : shop_info['image_in_near'],
				'long' : shop_info['longitude'],
				'late' : shop_info['latitude'],
				'distance' : getFlatternDistance(shop_info['latitude'],shop_info['longitude'],late,long)
			});
		}
		
	}

	all_list.sort(function(a,b){
		return a['distance'] < b['distance'];
	});

	return all_list.slice(0,size);

}

exports.getShopDetail = function(uid,shop_id){
	

	var shop_info = g_shop_cache['dict'][shop_id];
	var comment_num = shop_info['comment'].length;
	
	var comment = {};
	if(comment_num > 0){
		var last_comment = shop_info['comment'][shop_info['comment'].length -1];
		
		var player_info = g_playerlist.getPlayerInfo(last_comment['uid']);
		
		if(player_info != null){
			comment = {
				'head' : player_info['head'],
				'name' : player_info['name'],
				'comment' : last_comment['comment'],
				'datetime' : last_comment['datetime'],
				'remark' : last_comment['remark']
			};
		}
		
	}
	var shop_item_list = shop_info['shop_item_ids'].slice(0,10);

	var json_result = {
		"shop_id" : shop_id,
		"shop_info" : {
			'id' : shop_id,
			'name':shop_info['name'],
			'beg' : shop_info['beg'],
			'end' : shop_info['end'],
			'attention': false,
			'image': shop_info['image'],
			'address' : shop_info['address'],
			'telephone' : shop_info['telephone'],
			'comment_num' : comment_num,
			'comment' : comment,
			'shop_item' : [],
			'shop_info' : "11111111111111111111111111111",
			'shop_email' : shop_info['email'],
			'qq' : shop_info['qq'],
			'wx' : shop_info['wx'],
			'distribution_info' : 'distribution_info'
		}
	};

	for(var i in shop_item_list){
		var shop_item_id = shop_item_list[i];
		var shop_item = g_shop_cache['shop_items'][shop_item_id];
		json_result['shop_info']['shop_item'].push({
			'image': shop_item['image'],
			'item_name':shop_item['name'],
			'item_price':shop_item['price'],
			'item_show_price' : shop_item['show_price'],
			'item_attention':0,
			'item_id' : shop_item['id'],
			'shop_id' : shop_item['shop_id']
		});
	}
	

	if(shop_info == null){
		json_result['result'] = 1;
	}else{
		json_result['result'] = 0;
	}
	return json_result;
}

exports.getShopItemDetail = function(uid,shop_id,shop_item_id) {
	var shop_item_detail = {};
	shop_item_detail['error'] = 2;
	var shop_info = g_shop_cache['dict'][shop_id];
	
	if(shop_info != null){
		
		var shop_item_propertys = g_shop_cache['shop_item_property'][shop_item_id];
		shop_item_detail['error'] = 0;
		shop_item_detail['item_property'] = [];
		if(shop_item_propertys != null){
			for(var i in shop_item_propertys){
				var item_property = shop_item_propertys[i];
				shop_item_detail['item_property'].push({
					'property_name' : g_shop_cache['item_property_name'][item_property['property_type']]['name'],
					'property_value' : item_property['property_value'],
					'property_type' : item_property['property_type']
				});
			}
		}
		var shop_item_info = g_shop_cache['shop_items'][shop_item_id];
		//console.log(shop_item_info);
		if(shop_item_info != null){
			shop_item_detail['name'] = shop_item_info['name'];
			shop_item_detail['price'] = shop_item_info['price'];
			shop_item_detail['show_price'] = shop_item_info['show_price'];
			shop_item_detail['images'] = shop_item_info['images'];

		}
	}
	
	return shop_item_detail;
}

exports.getShopSpread = function(){
	var json_result = [];
	var shop_spread_list = g_shop_cache['show_items'];

	for(var i in shop_spread_list){
		var item_id = shop_spread_list[i];
		var item_info = g_shop_cache['shop_items'][item_id];

		json_result.push({
			'image' : item_info['image'],
			'item_name' : item_info['name'],
			'item_price' : item_info['price'],
			'item_show_price' : item_info['show_price'],
			'item_id' : item_info['id'],
			'shop_id' : item_info['shop_id'],
			'item_attention' : 0,
		});
	}

	return json_result;
}

exports.getMyFavoritesItems = function(items){
	var item_list = [];
	
	for(var i in items){
		var item_id = items[i]['item_id'];
		//var shop_id = items[i][shop_id]
		var item = g_shop_cache['shop_items'][item_id];
		var item_propertys = g_shop_cache['shop_item_property'][item_id];
		
		if(item != null){
			var shop_id = item['shop_id'];
			var shop = g_shop_cache['dict'][shop_id];
			if(shop != null){
				var favorites_item = {
					'add_favorites_time' : 0, //items[i]['add_time']
					'id' : item_id,
					'shop_id' : shop_id,
					'shop_name' : shop['name'],
					'item_name' : item['name'],
					'price' : item['price'],
					'image' : item['favorites_image']
				};
			}

			if(item_id in g_shop_cache['shop_item_property']){
				favorites_item['item_property'] = [];
			}else{
				favorites_item['item_property'] = [];
			}

			item_list.push(favorites_item);

		}
	}
	
	return item_list;
}

exports.getMyAttentionShopInfo = function(shop_id_list){
	var list = [];

	for(var i in shop_id_list){
		var shop_id = shop_id_list[i]['shop_id'];
		var shop_info = g_shop_cache['dict'][shop_id];

		list.push({
			'shop_id' : shop_id,
			'category_code' : shop_info['category_code'],
			'shop_image' : shop_info['image_in_attention'],
			'shop_attention_num': shop_info['attention'].length,
			'shop_name': shop_info['name'],
			'shop_business': shop_info['business'] || ""
		});
		
	}
	return list;
}


exports.InsertBecomeSeller = function(uid,shop_info){

	var shop_id = g_shop_cache['max_shop_id'] + 1;
	g_shop_cache['max_shop_id'] = shop_id;
	shop_info['id'] = shop_id;
	g_shop_cache['dict'][shop_id] = {
		'name' : shop_info['name'],
		'beg' : parseInt(shop_info['beg']),
		'end' : parseInt(shop_info['end']),

		'longitude': parseFloat(shop_info['longitude']),
		'latitude': parseFloat(shop_info['latitude']),
		'area_code' : parseInt(shop_info['area_code']),
		'category_code' : parseInt(shop_info['category_code']),
		'city_no' : parseInt(shop_info['city_no']),
		'telephone' : shop_info['telephone'],
		'info': shop_info['info'],
		'address' : shop_info['address'],
		'image' : shop_info['image'],
		'image_in_near' : shop_info['near_image'],
		'qq' : shop_info['qq'],
		'wx' : shop_info['wx'],
		'image_in_attention' : shop_info['image_in_attention'],
		'email' : '',
		'business' : '',
		'attention' : [],
		'comment' : [],
		'shop_item_ids' : [],
		'image_in_attention' : [],
		'manager' : {
			'name' : shop_info['shop_manager_name'],
			'telephone' : shop_info['shop_manager_telephone'],
			'address' : shop_info['shop_manager_address'],
			'card' : shop_info['shop_manager_card'],
			'email' : shop_info['shop_manager_email'],
		}
	};
	return shop_id;
}

exports.changeShopState = function(shop_id){
	var shop_info = g_shop_cache['dict'][shop_id];
	if(shop_info != null){
		shop_info['state'] = 1;
	}
}

exports.getShopActivityList = function(page,page_size){
	var list = g_shop_cache['activity_list'].slice((page - 1) * page_size,page_size);

	return {
		'list':list,
		'page' : page,
		'page_size':page_size,
		'total' : g_shop_cache['activity_list'].length
	};
}

exports.attentionShop = function(uid,shop_id){

	var shop_info = g_shop_cache['dict'][shop_id];
	if(shop_info != null){
		if(!(uid in shop_info['attention'])){
			shop_info['attention'].push(uid);
		}
	}
}

exports.CheckHasItem = function(shop_id,item_id){
	var shop_info = g_shop_cache['dict'][shop_id];	
	if(shop_info != null){
		for(var i in shop_info['shop_item_ids']){
			if(item_id == shop_info['shop_item_ids'][i]){
				return true;
			}
		}
	}
	return false;
}