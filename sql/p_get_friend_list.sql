DELIMITER // 
DROP PROCEDURE IF EXISTS p_get_friend_list
//
CREATE PROCEDURE p_get_friend_list(
	IN user_id int
)
BEGIN
	SET @strsql = concat('select last_get_friend_time INTO @last_login_time from userlogin where Id = ',user_id);
	
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;

	SET @strsql = concat("update userlogin SET last_get_friend_time = '",NOW(),"' where Id = ",user_id);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
	SELECT @last_login_time as last_get_friend_time;
	SET @strsql = concat('select * from user_relation LEFT JOIN user_info ON user_relation.fid = user_info.id WHERE user_relation.relation = 1 and user_relation.id = ',user_id);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;

	
END
//
DELIMITER ;