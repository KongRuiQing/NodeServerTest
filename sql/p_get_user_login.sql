DELIMITER // 
DROP PROCEDURE IF EXISTS p_get_user_login
//
CREATE PROCEDURE p_get_user_login(
	IN user_account varchar(11),
	IN user_password varchar(20))
BEGIN
	SET @user_id = 0;
	SET @count_num = 0;

	SET @strsql = concat("select Id INTO @user_id from userlogin where Account = '",user_account,"'",' and ',"Password='",user_password,"'");
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;

	IF @user_id > 0 THEN
		SELECT @user_id as id; #0

		SET @strsql = concat('select * from user_info where id = ',@user_id);
		prepare stmtsql from @strsql; 
		execute stmtsql; 
		deallocate prepare stmtsql;

		SET @strsql = concat('select count(*) INTO @count_num from user_request where fid=',@user_id);
		prepare stmtsql from @strsql; 
		execute stmtsql; 
		deallocate prepare stmtsql;
		SELECT @count_num as count; #2

		SET @strsql = concat('select * from user_request WHERE fid = ',@user_id,' ORDER BY send_time DESC limit 1');
		prepare stmtsql from @strsql; 
		execute stmtsql; 
		deallocate prepare stmtsql; #3

	END IF;
END
//
DELIMITER ;