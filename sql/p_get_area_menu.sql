DELIMITER // 
DROP PROCEDURE IF EXISTS p_get_area_menu;
//
CREATE DEFINER = CURRENT_USER PROCEDURE `p_get_area_menu`(
	in _areacode int/*当前页*/)
BEGIN

	set @strsql = concat('select * from area_menu where areacode = '  , _areacode); 

	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;

END

//
DELIMITER ;