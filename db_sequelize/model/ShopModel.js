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
    },
    'business' : {
      type : DataTypes.STRING,
      allowNull : true,
      defaultValue : '',
    },
    'distribution' : {
      type : DataTypes.STRING,
      allowNull : true,
      defaultValue : '',
    },
    'fix_telephone' : {
      type : DataTypes.STRING,
      allowNull : true,
      defaultValue : '',
    },
    'qq' : {
      type : DataTypes.STRING,
      allowNull : true,
      defaultValue : '',
    },
    'wx' : {
      type : DataTypes.STRING,
      allowNull : true,
      defaultValue : '',
    },
    'email' : {
      type : DataTypes.STRING,
      allowNull : true,
      defaultValue : '',
    },
    'qualification' : {
      type : DataTypes.STRING,
      allowNull : true,
      defaultValue : '',
    },
    'image1' : {
      type : DataTypes.STRING,
      allowNull : false,
      defaultValue : '',
    },
    'image2' : {
      type : DataTypes.STRING,
      allowNull : false,
      defaultValue : '',
    },
    'image3' : {
      type : DataTypes.STRING,
      allowNull : false,
      defaultValue : '',
    },
    'image4' : {
      type : DataTypes.STRING,
      allowNull : false,
      defaultValue : '',
    },
    'big_image' : {
        type:DataTypes.STRING,
        allowNull : false,
        defaultValue : '',
    },

  },{
    'tableName' : 'shop',
  });
};
