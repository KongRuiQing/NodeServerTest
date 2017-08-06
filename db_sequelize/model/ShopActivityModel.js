'use strict';
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('activity_list', {
    'id':{
      type:DataTypes.BIGINT(11), 
      autoIncrement:true, 
      primaryKey : true, 
    },
    'title':{
      type:DataTypes.STRING(255), 
      allowNull : false,
      defaultValue : ""
    },
    'image':{
      type:DataTypes.BIGINT(255), 
      allowNull : false,
      defaultValue : ""
    },
    'shop_id':{
      type:DataTypes.BIGINT(11), 
      allowNull : false,
      defaultValue : 0,
      unique : true,
    },
    
  },{
    'tableName' : 'activity_list',
    'updatedAt' : false,
  });
};
