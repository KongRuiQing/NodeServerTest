CREATE DEFINER = CURRENT_USER PROCEDURE `p_get_area_menu`(
	in _areacode varchar(10) /*地区代码*/
	)
BEGIN

set @strsql = concat('select * from area_menu where areacode',_areacode);
select @strsql;
prepare stmtsql from @strsql;
execute stmtsql; 
deallocate prepare stmtsql;
END;;