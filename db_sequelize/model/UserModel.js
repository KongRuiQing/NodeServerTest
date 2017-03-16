'use strict';
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('user', {
    'id':{
      type:DataTypes.BIGINT(11), 
      autoIncrement:true, 
      primaryKey : true, 
      unique : true
    }
  },{
    'tableName' : 'user_info',
  });
};
