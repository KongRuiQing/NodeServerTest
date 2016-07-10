DELIMITER // 
DROP PROCEDURE IF EXISTS p_get_all_shop_spread
//
CREATE PROCEDURE p_get_all_shop_spread(
	IN _page int,
	IN _page_size int,
	IN _area_code varchar(10)
	)
BEGIN
	SET @strsql = concat('select * from shop_spread where area_code = "', _area_code,'" limit ', _page_size * (_page - 1),',',_page_size);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
END
//
DELIMITER ;