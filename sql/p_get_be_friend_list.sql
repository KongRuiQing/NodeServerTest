DELIMITER // 
DROP PROCEDURE IF EXISTS p_get_be_friend_list
//
CREATE PROCEDURE p_get_be_friend_list(
	IN user_id int,
	IN last_time varchar(200)
	)
BEGIN
	SET @strsql = concat('select * from user_request left join user_info on user_request.uid = user_info.id',' where user_request.fid = ', user_id,' and user_request.send_time >',"'",last_time,"'",' order by user_request.send_time DESC');
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;

END
//
DELIMITER ;