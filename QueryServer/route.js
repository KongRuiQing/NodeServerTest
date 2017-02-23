var http_handler = require("./http_handler");

var handle_http = {};
handle_http['/shop_list'] = http_handler.getShopList;
handle_http['/shop_detail'] = http_handler.getShopDetail;
handle_http['/ad_image'] = http_handler.getAdImage;
handle_http['/shop_spread'] = http_handler.getShopSpread;
handle_http['/exchange_item_list'] = http_handler.getExchangeItemList;
handle_http['/exchange_item_detail'] = http_handler.getExchangeItemDetail;
handle_http['/activity_list'] = http_handler.getActivityList;
handle_http['/near_shop'] = http_handler.getNearShopList;
handle_http['/shop_item_detail'] = http_handler.getShopItemDetail;
handle_http['/my_favorites_item'] = http_handler.getMyFavoritesItems;
handle_http['/check_version'] = http_handler.getApkVersion;
handle_http['/area_menu'] = http_handler.getAreaMenu;
handle_http['/shop_attention'] = http_handler.getMyAttention;
handle_http['/shop_category'] = http_handler.getShopCategory;
handle_http['/game_shop_list'] = http_handler.getGameShopList;
handle_http['/get_my_shop_item_list'] = http_handler.getMyShopItemList;
handle_http['/get_my_shop_basic_info'] = http_handler.getMyShopInfo;
handle_http['/my_activity'] = http_handler.getMyActivity;
handle_http['/attention_board_list'] = http_handler.getShopAttentionBoard;
handle_http['/get_my_schedule_route_info'] = http_handler.getMyScheduleRouteInfo;
handle_http['/get_ready_be_seller_data'] = http_handler.getBeSellerData;

module.exports = handle_http;