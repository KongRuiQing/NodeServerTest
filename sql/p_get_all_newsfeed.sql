DELIMITER // 
DROP PROCEDURE IF EXISTS p_get_all_newsfeed
//
CREATE PROCEDURE p_get_all_newsfeed()
BEGIN
	SET @strsql = concat('select * from user_newsfeed');

	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
	
	SET @strsql = concat('select * from user_newsfeed_comment');
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;

END
//
DELIMITER ;