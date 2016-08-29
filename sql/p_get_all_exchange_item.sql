DELIMITER // 
DROP PROCEDURE IF EXISTS p_get_all_exchange_item
//
CREATE PROCEDURE p_get_all_exchange_item()
BEGIN
	SET @strsql = concat('select * from exchange');

	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
END
//
DELIMITER ;