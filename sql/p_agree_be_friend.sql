DELIMITER // 
DROP PROCEDURE IF EXISTS p_agree_be_friend
//
CREATE PROCEDURE p_agree_be_friend(
	IN user_id int,
	IN friend_id int
	)
BEGIN
	SET @strsql = concat('select count(*) into @count_num from user_request where uid =',user_id,' and ','fid = ',friend_id);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
	IF @count_num > 0 THEN
		
		SET @strsql = concat('DELETE FROM user_request WHERE uid = ',user_id,' and fid = ',friend_id);
		

		prepare stmtsql from @strsql; 
		execute stmtsql; 
		deallocate prepare stmtsql;

		SET @strsql = concat('DELETE FROM user_request WHERE uid = ',friend_id,' and fid = ',user_id);
		prepare stmtsql from @strsql; 
		execute stmtsql; 
		deallocate prepare stmtsql;

		SET @aid = user_id;
		SET @bid = friend_id;
		IF user_id > friend_id THEN
			SET @aid = friend_id;
			SET @bid = user_id;
		END IF;

		SET @strsql = concat('SELECT count(*) INTO @count_num from user_relation WHERE uid = ',@aid,' and ','fid = ',@bid);

		prepare stmtsql from @strsql; 
		execute stmtsql; 
		deallocate prepare stmtsql;

		IF @count_num = 0 THEN
			SET @strsql = concat('INSERT INTO user_relation (uid,fid,relation) VALUES (',@aid,',',@bid,',',1,')');
			prepare stmtsql from @strsql; 
			execute stmtsql; 
			deallocate prepare stmtsql;
			
		ELSE
			SET @strsql = concat('UPDATE user_relation SET relation =  1 where uid =',@aid,' and fid =', @bid);
			prepare stmtsql from @strsql; 
			execute stmtsql; 
			deallocate prepare stmtsql;
		END IF;
		SELECT id FROM user_relation WHERE uid = @aid AND fid = @bid;

		SET @strsql = concat('SELECT * FROM user_info WHERE id = ', friend_id);
		prepare stmtsql from @strsql; 
		execute stmtsql; 
		deallocate prepare stmtsql;
	ELSE
		SELECT 0 as id;
	END IF;
END
//
DELIMITER ;