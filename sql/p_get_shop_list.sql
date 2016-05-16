CREATE DEFINER = CURRENT_USER PROCEDURE `p_get_shop_list`(
	in _pagecurrent int,/*当前页*/
	in _pagesize int,/*每页的记录数*/
	in _colname varchar(1000),/*显示字段*/
	in _tablename varchar(1000),/*条件*/
	in _longitude float, /*经度*/
	in _latitude float/*纬度*/)
BEGIN
if _pagesize<=1 then 
	set _pagesize=20;
end if;
if _pagecurrent < 1 then 
	set _pagecurrent = 1; 
end if;

set @strsql = concat('select ',_colname,' from ',_tablename,' order by ','(longitude-',_longitude,')*(longitude-',_longitude,')+(latitude-',_latitude,')*(latitude-',_latitude,')',' limit ',_pagecurrent*_pagesize-_pagesize,',',_pagesize); 
select @strsql;
prepare stmtsql from @strsql; 
execute stmtsql; 
deallocate prepare stmtsql;
set @strsqlcount=concat('select count(1) as count from ',_tablename);/*count(1) 这个字段最好是主键*/
prepare stmtsqlcount from @strsqlcount; 
execute stmtsqlcount; 
deallocate prepare stmtsqlcount; 

END;;

IN `_pagecurrent` int,IN `_pagesize` int,IN `_colname` varchar(1000),IN `_tablename` varchar(20),IN `_longitude` float,IN `_latitude` float

call p_get_shop_list(1,20,"name",'shop',100,100)