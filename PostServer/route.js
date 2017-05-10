
var http_handler = require("./http_handler");
var http_handler_upload = require("./handle_upload");
var http_notify = require("./http_notify");
var handle_http = {};

handle_http['/login'] = http_handler.login;
handle_http['/logout'] = http_handler.logout;
handle_http['/register'] = http_handler.register;

handle_http['/attention_shop'] = http_handler.attentionShop;
handle_http['/add_favorites'] = http_handler.addToFavorites;
handle_http['/change_user_info'] = http_handler.changeUserInfo;
// shop_item
handle_http['/add_shop_item'] = http_handler.addShopItem;
// seller
handle_http['/become_seller'] = http_handler.becomeSeller;

handle_http['/save_shop_basic_info'] = http_handler.saveMyShopBasicInfo;
handle_http['/remove_favorites_item'] = http_handler.removeFavoritesItem;
handle_http['/renewal'] = http_handler.renewal;
handle_http['/add_shop_activity'] = http_handler.addShopActivity;
handle_http['/save_seller_info'] = http_handler.saveSellerInfo;
handle_http['/save_shop_item'] = http_handler.saveShopItem;

handle_http['/upload_schedule_image'] = http_handler.uploadScheduleImage;
handle_http['/post_schedule_comment'] = http_handler.postScheduleComment;
handle_http['/change_schedule_title'] = http_handler.changeScheduleTitle;
handle_http['/add_shop_to_schedule'] = http_handler.addShopToSchedule;
handle_http['/remove_shop_from_schedule'] = http_handler.removeShopFromSchedule;
handle_http['/add_shop_item_image'] = http_handler.setShopItemImage;
handle_http['/relogin'] = http_handler.reLogin;
handle_http['/claim_shop'] = http_handler.claimShop;
handle_http['/upload_image'] = http_handler_upload.uploadImage;

handle_http['/admin/v1/ad'] = http_notify.changeAdImage;
handle_http['/admin/v1/shop'] = http_notify.shopCallback;
handle_http['/admin/v1/shop_item']  = http_notify.notifyShopItem;
handle_http['/send_message'] = http_handler.sendMessage;
handle_http['/off_shelve_shop_item'] = http_handler.offShelveShopItem;
module.exports = handle_http;