DELIMITER // 
CREATE PROCEDURE p_find_player(IN find_name varchar(11),IN user_id int)
BEGIN

	

	set @strsql = concat('select Id INTO @find_user_id from userlogin where Id =',find_name,' or ',' Account=',find_name);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
	
	IF @find_user_id > 0 THEN
	
		set @strsql = concat('select * from user_info where id=',@find_user_id);
		prepare stmtsql from @strsql; 
		execute stmtsql;
		deallocate prepare stmtsql;

		if @find_user_id < user_id THEN
			set @strsql = concat('select * from user_relation where uid = ',@find_user_id,' and fid = ',user_id);
		ELSE
			set @strsql = concat('select * from user_relation where uid = ',user_id,' and fid = ',@find_user_id);
		END IF;
		prepare stmtsql from @strsql; 
		execute stmtsql;
		deallocate prepare stmtsql;
		
	END IF;

END
//
DELIMITER ; 