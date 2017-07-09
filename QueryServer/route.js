var http_handler = require("./http_handler");
var http_config = require("./logic/http_config.js");

var handle_http = {};
handle_http['/shop_spread'] = http_handler.getShopSpread;
handle_http['/shop_list'] = http_handler.getShopList;
handle_http['/shop_detail'] = http_handler.getShopDetail;
handle_http['/ad_image'] = http_handler.getAdImage;

handle_http['/exchange_item_list'] = http_handler.getExchangeItemList;
handle_http['/exchange_item_detail'] = http_handler.getExchangeItemDetail;
handle_http['/activity_list'] = http_handler.getActivityList;
handle_http['/near_shop'] = http_handler.getNearShopList;
handle_http['/shop_item_detail'] = http_handler.getShopItemDetail;
handle_http['/my_favorites_item'] = http_handler.getMyFavoritesItems;
handle_http['/check_version'] = http_handler.getApkVersion;
handle_http['/area_menu'] = http_handler.getAreaMenu;
handle_http['/shop_attention'] = http_handler.getMyAttention;
handle_http['/category'] = http_handler.getCategory;
handle_http['/game_shop_list'] = http_handler.getGameShopList;
handle_http['/game_item_list'] = http_handler.getGameItemList;
handle_http['/get_my_shop_item_list'] = http_handler.getMyShopItemList;
handle_http['/get_my_shop_basic_info'] = http_handler.getMyShopInfo;
handle_http['/get_my_shop_item_detail'] = http_handler.getMyShopItemDetail;
handle_http['/my_activity'] = http_handler.getMyActivity;
handle_http['/attention_board_list'] = http_handler.getShopAttentionBoard;
handle_http['/get_my_schedule_route_info'] = http_handler.getMyScheduleRouteInfo;
handle_http['/get_ready_be_seller_data'] = http_handler.getBeSellerData;
handle_http['/shop_claim_state'] = http_handler.getShopClaimState;
handle_http['/custom_service'] = http_config.getCustomService;
handle_http['/get_attention_group'] = http_handler.getAttentionGroup;
handle_http['/search'] = http_handler.getSearchResult;
// group msg

handle_http['/history_group_msg'] = http_handler.getGroupMsgHistory;
handle_http['/shop_group_msg'] = http_handler.getGroupMsgList;
handle_http['/shop_group_chat'] = http_handler.getGroupChatList;
module.exports = handle_http;
