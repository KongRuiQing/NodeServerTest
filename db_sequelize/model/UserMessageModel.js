'use strict';
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_message', {
    'id': {
      type: DataTypes.BIGINT(11),
      autoIncrement: true,
      primaryKey: true,

    },
    'image': {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",

    },
    'title': {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
    },
    'info': {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "",
    },
    'detail_type': {
      type: DataTypes.BIGINT(2),
      allowNull: false,
      defaultValue: "",
    },
    'detail_content' : {
      type: DataTypes.STRING(600),
      allowNull: false,
      defaultValue: "",
    },
    'deletedAt' : {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: 0,
    }
  }, {
    'tableName': 'user_message',
    'timestamps' : true,
  });
};