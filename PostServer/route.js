
var http_handler = require("./http_handler");
var http_handler_upload = require("./handle_upload");
var http_notify = require("./http_notify.js");
var handle_group = require("./handle_group.js");
var handle_shop = require("./handle_shop.js");
var handle_http = {};


handle_http['/logout'] = http_handler.logout;
handle_http['/register'] = http_handler.register;

handle_http['/attention_shop'] = http_handler.attentionShop;
handle_http['/add_favorites'] = http_handler.addToFavorites;
handle_http['/change_user_info'] = http_handler.changeUserInfo;
// shop_item
handle_http['/add_shop_item'] = http_handler.addShopItem;
handle_http['/remove_shop_item'] = http_handler.removeShopItem;
// seller
handle_http['/become_seller'] = http_handler.becomeSeller;

//handle_http['/save_shop_basic_info'] = http_handler.saveMyShopBasicInfo;
handle_http['/remove_favorites_item'] = http_handler.removeFavoritesItem;
handle_http['/renewal'] = http_handler.renewal;
handle_http['/add_shop_activity'] = handle_shop.addShopActivity;
handle_http['/save_seller_info'] = http_handler.saveSellerInfo;
handle_http['/save_shop_item'] = http_handler.saveShopItem;

handle_http['/upload_schedule_image'] = http_handler.uploadScheduleImage;
handle_http['/post_schedule_comment'] = http_handler.postScheduleComment;
handle_http['/change_schedule_title'] = http_handler.changeScheduleTitle;
handle_http['/add_shop_to_schedule'] = http_handler.addShopToSchedule;
handle_http['/remove_shop_from_schedule'] = http_handler.removeShopFromSchedule;
handle_http['/add_shop_item_image'] = http_handler.setShopItemImage;
handle_http['/relogin'] = http_handler.reLogin;
handle_http['/claim_shop'] = handle_shop.claimShop;
handle_http['/upload_image'] = http_handler_upload.uploadImage;

handle_http['/admin/v1/ad'] = http_notify.changeAdImage;
handle_http['/admin/v1/shop'] = http_notify.shopCallback;
handle_http['/admin/v1/shop_item']  = http_notify.notifyShopItem;
handle_http['/send_message'] = http_handler.sendMessage;
handle_http['/off_shelve_shop_item'] = http_handler.offShelveShopItem;
handle_http['/close_shop'] = http_handler.closeShop;
// group
handle_http['/group_msg'] = handle_group.addGroupMsg;
handle_http['/clear_group_msg'] = handle_group.clearGroupMsg;
handle_http['/group_chat'] = handle_group.addGroupChat;
module.exports = handle_http;