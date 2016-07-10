DELIMITER // 
DROP PROCEDURE IF EXISTS p_add_newsfeed
//
CREATE PROCEDURE p_add_newsfeed(
	IN user_id int,
	IN content varchar(500),
	IN image1 varchar(200),
	IN image2 varchar(200),
	IN image3 varchar(200),
	IN image4 varchar(200),
	IN image5 varchar(200),
	IN image6 varchar(200),
	IN image7 varchar(200),
	IN image8 varchar(200))
BEGIN
	SET @strsql = concat('select count(*) into @count_num from userlogin where Id =', user_id);

	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
	
	IF @count_num = 1 THEN

		SET @insert_key = '';
		SET @insert_value = '';
		SET @hasContent = 0;
		IF NOT (ISNULL(content) || LENGTH(TRIM(content)) < 1) THEN

			SET @insert_key = concat(@insert_key,'content');
			SET @insert_value = concat(@insert_value,"'",content,"'");
			SET @hasContent = 1;
		END IF;

		IF  NOT (ISNULL(image1) || LENGTH(TRIM(image1)) < 1) THEN

			SET @insert_key = concat(@insert_key,',','image1');
			SET @insert_value = concat(@insert_value,',',"'",image1,"'");
			
		END IF;

		IF NOT (ISNULL(image2) || LENGTH(TRIM(image2)) < 1) THEN

			SET @insert_key = concat(@insert_key,',','image2');
			SET @insert_value = concat(@insert_value,',',"'",image2,"'");
			
		END IF;
		
		IF NOT (ISNULL(image3) || LENGTH(TRIM(image3)) < 1) THEN

			SET @insert_key = concat(@insert_key,',','image3');
			SET @insert_value = concat(@insert_value,',',"'",image3,"'");
			
		END IF;

		IF NOT (ISNULL(image4) || LENGTH(TRIM(image4)) < 1) THEN

			SET @insert_key = concat(@insert_key,',','image4');
			SET @insert_value = concat(@insert_value,',',"'",image4,"'");
			
		END IF;

		IF NOT (ISNULL(image5) || LENGTH(TRIM(image5)) < 1) THEN

			SET @insert_key = concat(@insert_key,',','image5');
			SET @insert_value = concat(@insert_value,',',"'",image5,"'");
			
		END IF;

		IF NOT (ISNULL(image6) || LENGTH(TRIM(image6)) < 1) THEN

			SET @insert_key = concat(@insert_key,',','image6');
			SET @insert_value = concat(@insert_value,',',"'",image6,"'");
			
		END IF;

		IF NOT (ISNULL(image7) || LENGTH(TRIM(image7)) < 1) THEN

			SET @insert_key = concat(@insert_key,',','image7');
			SET @insert_value = concat(@insert_value,',',"'",image7,"'");
			
		END IF;
		IF NOT (ISNULL(image8) || LENGTH(TRIM(image8)) < 1) THEN

			SET @insert_key = concat(@insert_key,',','image8');
			SET @insert_value = concat(@insert_value,',',"'",image8,"'");
			
		END IF;

		
		SET @strsql = concat('insert into user_newsfeed',' ');
		IF NOT (ISNULL(@insert_key) || LENGTH(TRIM(@insert_key)) < 1) THEN
			IF @hasContent = 1 THEN
				SET @insert_key = concat('uid',',',@insert_key);
				SET @insert_value = concat(user_id,',',@insert_value);
			ELSE
				SET @insert_key = concat('uid', @insert_key);
				SET @insert_value = concat(user_id, @insert_value);
			END IF;
			
			SET @strsql = concat(@strsql,'(',@insert_key,')',' ','VALUES',' ','(',@insert_value,')');
			prepare stmtsql from @strsql; 
			execute stmtsql; 
			deallocate prepare stmtsql;
		END IF;

	END IF;

	SELECT LAST_INSERT_ID() INTO @feed_id;

	SELECT * FROM user_newsfeed WHERE id = @feed_id;

END
//
DELIMITER ;