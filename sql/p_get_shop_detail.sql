DELIMITER // 
DROP PROCEDURE IF EXISTS p_get_shop_detail
//
CREATE DEFINER = CURRENT_USER PROCEDURE `p_get_shop_detail`(
	in _shopid varchar(10), /*商铺代码*/
	in _playerid int
	)
/**' order by ','(longitude-',_longitude,')*(longitude-',_longitude,')+(latitude-',_latitude,')*(latitude-',_latitude,')'*/
BEGIN
	set @strsql = concat('select count(*) as shop_num from shop where Id =',_shopid);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
	/*0*/
	set @strsql = concat('select ','*',' from ','shop_item left join item on shop_item.item_id = item.item_id where shop_id =',_shopid);

	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
	
	set @strsql = concat('select * from shop where Id = ' ,_shopid);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;

	set @strsql = concat('select count(*) as attention_num from shop_attention where shop_id = ',_shopid);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;

	set @strsql = concat('select count(*) as has_attention from shop_attention where shop_id = ',_shopid,' and uid = ',_playerid);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
	/*5*/

END;;
//
DELIMITER ;
