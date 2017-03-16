'use strict';
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('shop', {
    'Id':{
      type:DataTypes.BIGINT(11), 
      autoIncrement:true, 
      primaryKey : true, 
      unique : true
    },
    'uid' : {
      type : DataTypes.BIGINT(11),
      unique : true,
      references : {
        model : 'user',
        key : 'id',
      }
    },
    'name': { 
      type: DataTypes.STRING,  
      allowNull: false,
      comment:'用户名' 
    },
    'beg' : {
      type:DataTypes.BIGINT(11),
      allowNull:false,
      defaultValue:0
    },
    'end' : {
      type : DataTypes.BIGINT(11),
      allowNull : false,
      defaultValue : 0,
    },
    'days' : {
      type:DataTypes.STRING,
      allowNull : false,
      defaultValue : 0
    },
    'longitude' : {
      type : DataTypes.FLOAT,
      allowNull : false,
      defaultValue : 0
    },
    'latitude' : {
      type : DataTypes.FLOAT,
      allowNull : false,
      defaultValue : 0
    },
    'city_no' : {
      type:DataTypes.BIGINT(11),
      allowNull:false,
      defaultValue:0
    },
    'area_code' : {
      type:DataTypes.BIGINT(11),
      allowNull:false,
      defaultValue:0
    },
    'address' : {
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:""
    },
    'telephone' : {
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:""
    },
    'category_code1' : {
      type:DataTypes.BIGINT(11),
      allowNull:false,
      defaultValue:0
    },
    'category_code2' : {
      type:DataTypes.BIGINT(11),
      allowNull:false,
      defaultValue:0
    },
    'category_code3' : {
      type:DataTypes.BIGINT(11),
      allowNull:false,
      defaultValue:0
    },
    'user_name' : {
      type : DataTypes.STRING,
      allowNull : false,
      defaultValue : "",
    },
    'card_image' : {
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:""
    },
    'card_number' : {
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:""
    },
    'state' : {
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:""
    }

  },{
    'tableName' : 'shop',
  });
};
