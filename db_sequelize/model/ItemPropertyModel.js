'use strict';
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('shop_item_property', {
    'id':{
      type:DataTypes.BIGINT(11), 
      autoIncrement:true, 
      primaryKey : true, 
      unique : true
    },
    'item_id' : {
      type : DataTypes.BIGINT(11),
      allowNull : false,
      defaultValue : 0,
      unique : 'item_property',
    },
    'property_type' : {
      type : DataTypes.STRING,
      allowNull : false,
      defaultValue : "",
      comment : ''
    },
    'property_value': { 
      type: DataTypes.STRING,  
      allowNull: false,
      comment:'',
      defaultValue : 0, 
    },
    'is_show' : {
      type:DataTypes.BIGINT(2),
      allowNull:false,
      defaultValue:0
    },
    'index' :{ 
      type:DataTypes.BIGINT(11),
      allowNull : false,
      defaultValue : 0,
      unique : 'item_property',

    }
  },{
  'tableName' : 'shop_item_property',
  });
};
