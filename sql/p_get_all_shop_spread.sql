DELIMITER // 
DROP PROCEDURE IF EXISTS p_get_all_shop_spread
//
CREATE PROCEDURE p_get_all_shop_spread(
	IN _page int,
	IN _page_size int,
	IN _city_no varchar(10),
	IN _area_code varchar(10),
	IN _cate_code varchar(10),
	IN _sort_code varchar(10)
	)
BEGIN
	DECLARE _where varchar(200) DEFAULT '';

	IF CHAR_LENGTH(_city_no) > 0 THEN
	
		SET _where = concat('WHERE shop.city_no = "',_city_no,'"');
	END IF;

	IF CHAR_LENGTH(_area_code) > 0 THEN
	
		IF CHAR_LENGTH(_where) > 0 THEN
			SET _where = concat(' AND shop.area_code = "',_area_code,'"');
		ELSE
			SET _where = concat('WHERE shop.area_code = "',_area_code,'"');
		END IF;
	END IF;

	IF CHAR_LENGTH(_cate_code) > 0 THEN
	
		IF CHAR_LENGTH(_where) > 0 THEN
			SET _where = concat(' AND shop.category_code = "',_cate_code,'"');
		ELSE
			SET _where = concat('WHERE shop.category_code = "',_cate_code,'"');
		END IF;
	END IF;

	

	IF CHAR_LENGTH(_where) > 0 THEN
		SET @strsql = concat('SELECT * FROM shop_spread left join shop on shop_spread.shop_id = shop.Id ',_where,' LIMIT ', _page_size * (_page - 1),',',_page_size);
	ELSE
		SET @strsql = concat('SELECT * FROM shop_spread left join shop on shop_spread.shop_id = shop.Id ',' LIMIT ', _page_size * (_page - 1),',',_page_size);
	END IF;
	
	prepare stmtsql from @strsql; 
	execute stmtsql; 
	deallocate prepare stmtsql;
END
//
DELIMITER ;