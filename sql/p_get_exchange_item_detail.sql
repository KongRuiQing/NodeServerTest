DELIMITER // 
DROP PROCEDURE IF EXISTS p_get_exchange_item_detail
//
CREATE PROCEDURE p_get_exchange_item_detail(
	IN _itemid int)
BEGIN
	SET @strsql = concat('select * from exchange where id = ',_itemid);

	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
END
//
DELIMITER ;