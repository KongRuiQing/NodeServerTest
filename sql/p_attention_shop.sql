DELIMITER // 
DROP PROCEDURE IF EXISTS p_attention_shop
//
CREATE DEFINER = CURRENT_USER PROCEDURE `p_attention_shop`(
	in _shopid int, /**/
	in _uid int)
BEGIN
	SET @with_attention = 0;

	set @strsql = concat('select count(*) into @with_attention from shop_attention where shop_id =',_shopid,' and ','uid=',_uid);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;

	IF @with_attention = 0 THEN
		SET @strsql = concat('insert into shop_attention (uid,shop_id) values (',_shopid,',',_uid,')');
		prepare stmtsql from @strsql; 
		execute stmtsql; 
		deallocate prepare stmtsql;
	END IF

	set @strsql = concat('select count(*) as attention_result from shop_attention where shop_id =',_shopid,' and ','uid=',_uid);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;


END
//
DELIMITER ;
