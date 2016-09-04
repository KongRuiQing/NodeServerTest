DELIMITER // 
DROP PROCEDURE IF EXISTS p_get_activity_list
//
CREATE PROCEDURE p_get_activity_list(
	IN page int,
	IN size int)
BEGIN
	SET @strsql = concat('select * from activity_list LIMIT ',(page - 1) * size , ',',size);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
END
//
DELIMITER ;

活动1 