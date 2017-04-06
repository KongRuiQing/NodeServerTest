'use strict';
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('userLogin', {
    'id':{
      type:DataTypes.BIGINT(11), 
      autoIncrement:true, 
      primaryKey : true, 
      unique : true
    },
    'Account': { 
      type: DataTypes.STRING,  
      allowNull: false,
      comment:'用户名' 
    },
    'Password': { 
      type: DataTypes.STRING, 
      allowNull: false, 
      comment:'用户密码'
    },
    'state': { 
      type: DataTypes.INTEGER(4), 
      allowNull: false, 
      defaultValue: 0, 
      comment:'是否正常状态' 
    },
    'longitude' : {
      type : DataTypes.FLOAT,
      allowNull : true,
      defaultValue : 0,
      'comment' : '经度',
    },
    'latitude' : {
      type : DataTypes.FLOAT,
      allowNull : true,
      defaultValue : 0,
      'comment' : '经度',
    },
    
  },{
    'tableName' : 'userLogin',
  });
};
