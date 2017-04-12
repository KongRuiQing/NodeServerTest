'use strict';
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('shop_attention', {
    'id':{
      type:DataTypes.BIGINT(11), 
      autoIncrement:true, 
      primaryKey : true, 
      unique : true
    },
    'uid':{
      type:DataTypes.BIGINT(11), 
      allowNull : false,
      defaultValue : 0,
      unique:'shop_attention_unique',
      
    },
    'shop_id':{
      type:DataTypes.BIGINT(11), 
      allowNull : false,
      defaultValue : 0,
      unique:'shop_attention_unique',
    }
  },{
    'tableName' : 'shop_attention',
  });
};
