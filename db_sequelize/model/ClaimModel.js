'use strict';
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('claim', {
    'id':{
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
    'shop_id' : {
      type : DataTypes.BIGINT(11),
      allowNull : false,
      defaultValue : 0,
    },
    'name': { 
      type: DataTypes.STRING,  
      allowNull: false,
      comment:'用户名' 
    },
    'telephone' : {
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:""
    },
    'cs' : {
      type : DataTypes.BIGINT(11),
      allowNull : false,
      defaultValue : 0,
    }
  });
};
