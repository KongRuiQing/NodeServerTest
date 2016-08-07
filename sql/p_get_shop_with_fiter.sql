DELIMITER //
DROP PROCEDURE IF EXISTS p_get_shop_with_filter
//
CREATE DEFINER = CURRENT_USER PROCEDURE `p_get_shop_with_filter`(
	in _cityno varchar(10), /*地区代码*/
	in _areacode varchar(10), /*地区代码*/
	in _categorycode varchar(10),
	in _sortkey varchar(10),
	in _pagecurrent int,
	in _pagesize int
	)
BEGIN
/**' order by ','(longitude-',_longitude,')*(longitude-',_longitude,')+(latitude-',_latitude,')*(latitude-',_latitude,')'*/
BEGIN
	#Routine body goes here...

	set @strsql = concat('select ','*',' from ','shop');

	IF  (ISNULL(_cityno) || LENGTH(trim(_cityno))<1) THEN
	
		set _cityno = '167';

	END IF;

	set @str_where = concat(' where city_no=',_cityno);

	IF  !(ISNULL(_areacode) || LENGTH(trim(_areacode))<1) THEN
		set @str_where = concat(@str_where,' and ','area_code=',_areacode);
	END IF;

	IF  !(ISNULL(_categorycode) || LENGTH(trim(_categorycode))<1) THEN
	
		set @str_where = concat(@str_where,' and',' category_code=',_categorycode);
	
	END IF;
	set @str_sort = NULL;

	set @strsql = concat(@strsql,@str_where);

	set @strsql = concat(@strsql,' limit ',_pagecurrent*_pagesize-_pagesize,',',_pagesize);


	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;


END
//
DELIMITER ;

#call p_get_shop_with_filter('116000','0','1',1,10)