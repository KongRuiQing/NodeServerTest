'use strict';
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('shop_item', {
    'id':{
      type:DataTypes.BIGINT(11), 
      autoIncrement:true, 
      primaryKey : true, 
      unique : true
    },
    'shop_id' : {
      type : DataTypes.BIGINT(11),
      allowNull : false,
      defaultValue : 0
    },
    'name' : {
      type : DataTypes.STRING,
      allowNull : false,
      defaultValue : "",
    },
    'price': { 
      type: DataTypes.FLOAT(11,1),  
      allowNull: false,
      comment:'',
      defaultValue : 0, 
    },
    'show_price' : {
      type:DataTypes.BIGINT(11),
      allowNull:false,
      defaultValue:0
    },
    'link' : {
      type : DataTypes.STRING,
      allowNull : false,
      defaultValue : "",
      comment : "外部网络链接",
    },
    'category_code':{
      type : DataTypes.BIGINT(11),
      allowNull : false,
      defaultValue : 0
    },
    'group_index' : {
        type : DataTypes.BIGINT(3),
        allowNull: false,
        defaultValue : 0
    },
    'state' : {
      type : DataTypes.BIGINT(3),
      allowNull : false,
      defaultValue : 0,
    }
  },{
  'tableName' : 'shop_item',
  });
};
