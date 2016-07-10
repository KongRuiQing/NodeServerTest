CREATE DEFINER = CURRENT_USER PROCEDURE `p_get_shop_detail`(
	in _shopid varchar(10), /*商铺代码*/
	)
/**' order by ','(longitude-',_longitude,')*(longitude-',_longitude,')+(latitude-',_latitude,')*(latitude-',_latitude,')'*/
BEGIN
	set @strsql = concat('select count(*) as shop_num from shop where Id =',_shopid);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
	/*0*/
	set @strsql = concat('select ','*',' from ','shop_item left join item on shop_item.item_id = item.item_id where shop_id =',_shopid);

	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
	
	set @strsql = concat('select * from shop where Id = ' ,_shopid);
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;

	/*5*/

END;;

#call p_get_shop_with_filter('116000','0','1',1,10)
