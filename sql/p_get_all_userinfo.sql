DELIMITER // 
DROP PROCEDURE IF EXISTS p_get_all_userinfo
//
CREATE PROCEDURE p_get_all_userinfo()
BEGIN
	SET @strsql = 'select * from user_info';
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;

	SET @strsql = 'select * from userlogin';
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
END
//
DELIMITER ;