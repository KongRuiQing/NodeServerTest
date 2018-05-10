'use strict';
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('user', {
    'id': {
      type: DataTypes.BIGINT(11),
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    'head': {
      type: DataTypes.STRING,
      defaultValue: "player/default.png"
    },
    'name': {
      type: DataTypes.STRING,
      defaultValue: '用户'
    },
    'sign': {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    'address': {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    'telephone': {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    'email': {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    'birthday_timestamp': {
      type: DataTypes.DATE,
    },
    'real_name': {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    'real_name': {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }
  }, {
    'tableName': 'user_info',
  });
};