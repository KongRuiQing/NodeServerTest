DELIMITER // 
DROP PROCEDURE IF EXISTS p_get_all_newsfeed
//
CREATE PROCEDURE p_get_all_newsfeed()
BEGIN
	SET @strsql = concat('select * from user_newsfeed');

	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
	
	SET @strsql = concat('select * from user_newsfeed_comment left join user_info on user_info.id = user_newsfeed_comment.uid order ');
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;

END
//
DELIMITER ;