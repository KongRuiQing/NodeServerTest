DELIMITER // 
DROP PROCEDURE IF EXISTS p_get_ad_images
//
CREATE PROCEDURE p_get_ad_images()
BEGIN
	SET @strsql = 'select * from shop_ad';
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;

END
//
DELIMITER ;