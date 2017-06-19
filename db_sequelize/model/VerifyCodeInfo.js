'use strict';
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('verifycode_info', {
    'telephone': {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    'expire_time': {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: false,
    },
    'last_time': {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: false,
    },
    'count': {
      type: DataTypes.INTEGER(5),
      defaultValue: "",
      allowNull: false,
    }
  }, {
    'tableName': 'verifycode_info',
    'createdAt' : false,
    'updatedAt' : false,
  });
};