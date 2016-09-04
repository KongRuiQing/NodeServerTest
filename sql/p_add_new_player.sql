DELIMITER // 
DROP PROCEDURE IF EXISTS p_add_new_player
//
CREATE PROCEDURE p_add_new_player(
	IN uid int,
	IN telephone varchar(11),
	IN password varchar(11))
BEGIN
	SET @find_user_id = 0;
	SET @strsql = concat('select Id INTO @find_user_id from userlogin where Account =',telephone);
	PREPARE stmtsql from @strsql; 
	EXECUTE stmtsql; 
	DEALLOCATE PREPARE stmtsql;
	IF @find_user_id > 0 THEN
		SET @strsql = concat('INSERT INTO userlogin (Id,Account,Password) VALUES (',uid,',"',telephone,'","',password,'"")');
		PREPARE stmtsql from @strsql; 
		EXECUTE stmtsql; 
		DEALLOCATE PREPARE stmtsql;

		SET @strsql = concat('INSERT INTO user_info (id,name,telephone) VALUES (',uid,',"','用户',uid,'","',telephone,'"")');
		PREPARE stmtsql from @strsql; 
		EXECUTE stmtsql; 
		DEALLOCATE PREPARE stmtsql;
	END IF;

END
//
DELIMITER ; 