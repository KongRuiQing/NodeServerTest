DELIMITER // 
CREATE PROCEDURE p_get_be_friend_list(IN user_id int)
BEGIN
	SET @strsql = concat('select * from user_relation left join user_info on user_info.id = user_relation.uid where user_relation.fid = ',user_id);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
END
//
DELIMITER ;