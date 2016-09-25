
var util = require('util');

var g_shop_cache = {
	'dict' : {},
	'item_property_name' : {},
	'shop_item_property' : {},
	'shop_items' : {},
	'show_items' : []
};

exports.InitFromDb = function(shop_list,shop_comment,shop_item,shop_item_property,shop_item_property_config){
	
	g_shop_cache['dict'] = {};
	
	for(var i in shop_list){
		var shop_id = shop_list[i]['Id'];
		
		g_shop_cache['dict'][shop_id] = {
			'name' : shop_list[i]['name'],
			'address' : shop_list[i]['address'],
			'city_no' : parseInt(shop_list[i]['city_no']),
			'zone': parseInt(shop_list[i]['zone']),
			'beg' : parseInt(shop_list[i]['beg']),
			'end' : parseInt(shop_list[i]['end']),
			'img' : shop_list[i]['img'],
			'telephone' : shop_list[i]['telephone'],
			'longitude': parseFloat(shop_list[i]['longitude']),
			'latitude': parseFloat(shop_list[i]['latitude']),
			'image_in_near' : shop_list[i]['near_image'],
			'category' : shop_list[i]['category'] || 0,
			'attention' : [],
			'comment' : [],
			'shop_item_ids' : []
		};
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
				'is_show_main' : parseInt(item['is_show'])
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
}

exports.getShopList = function(city_no,zone,category,page){
	var all_list = [];
	
	for(var i in g_shop_cache['dict']){

		var shop_info = g_shop_cache['dict'][i];

		if(shop_info['city_no'] == city_no && 
			(zone == shop_info['zone'] || zone == 0) && 
			(category == shop_info['category'] || category == 0)){
			all_list.push({
				'shop_name' : shop_info['name'],
				'shop_address' : shop_info['address'],
				'shop_image' : shop_info['img'],
				'long' : shop_info['longitude'],
				'late' : shop_info['latitude'],
				'shop_attention' : shop_info['attention'],
				"id" : parseInt(i)
			});
	}
}

return {
	'list':all_list.slice((page - 1) * 20, 20),
	'count' : all_list.length
};
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
		
		var player = g_playerlist.getPlayerInfo(last_comment['uid']);
		
		if(player != null){
			comment = {
				'head' : player['head'],
				'name' : player['nick_name'],
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
			'image': shop_info['img'],
			'address' : shop_info['address'],
			'telephone' : shop_info['telephone'],
			'comment_num' : comment_num,
			'comment' : comment,
			'shop_item' : [],
			'shop_info' : "11111111111111111111111111111",
			'shop_email' : 'abc@123.com',
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
		
		if(shop_item_propertys != null){
			shop_item_detail['item_property'] = [];
			shop_item_detail['error'] = 0;
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
		var itemId = items[i];
		var item = g_shop_cache['shop_items'][itemId];
		var item_property = g_shop_cache['shop_item_property'][itemId];
		if(item != null){
			var shop_id = item['shop_id'];
			var shop = g_shop_cache['dict'][shop_id];
			if(shop != null){
				item_list.push({
					'add_favorites_time' : items[i]['add_favorites_time'],
					'id' : itemId,
					'shop_id' : shop_id,
					'shop_name' : shop['name'],
					'item_name' : item['name'],
					'item_property' : [
						{
							'property_name' : g_shop_cache['item_property_name'][item_property[itemId]['property_type']],
							'property_value' : item_property[itemId]['property_value']
						},
						{
							'property_name' : g_shop_cache['item_property_name'][item_property[itemId]['property_type']],
							'property_value' : item_property[itemId]['property_value']
						}
					],
					'price' : item['price'],
					'image' : item['favorites_image']
				});
			}
		}
	}

	return item_list;
}