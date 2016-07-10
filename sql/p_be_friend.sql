DELIMITER // 
CREATE PROCEDURE p_be_friend(IN user_id int,IN friend_id int)
BEGIN

	BEGIN

	set @strsql = concat('select count(*) into @count_num from userlogin where Id = ', friend_id);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
	
	IF @count_num = 1 THEN
		
		set @strsql = concat('select count(*) into @count_num from user_request where uid=',' ',user_id,' ','and',' ','fid=',friend_id);
		
		prepare stmtsql from @strsql; 
		execute stmtsql;
		deallocate prepare stmtsql;

		

		IF @count_num  = 0 THEN
		
			set @strsql = concat('select count(*) into @count_num from user_relation where uid=',' ',user_id,' ','and',' ','fid=',friend_id);
			prepare stmtsql from @strsql; 
			execute stmtsql;
			deallocate prepare stmtsql;
			
			IF @count_num = 0 THEN

				set @strsql = concat('insert into user_request (uid,fid)values(',user_id,',',friend_id,')');
				
				prepare stmtsql from @strsql; 
				execute stmtsql;
				deallocate prepare stmtsql;
			

			END IF;

		

		END IF;

	END IF;

	set @strsql = concat('select count(*) as success from user_request where uid=',' ',user_id,' ','and',' ','fid=',friend_id);
	prepare stmtsql from @strsql; 
	execute stmtsql;
	deallocate prepare stmtsql;

END

END
//
DELIMITER ;