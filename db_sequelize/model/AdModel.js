'use strict';
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('shop_ad', {
    'id': {
      type: DataTypes.BIGINT(11),
      autoIncrement: true,
      primaryKey: true,
    },
    'position': {
      type: DataTypes.INT(3),
      defaultValue: 0,
      allowNull : false,
    },
    'index': {
      type: DataTypes.INT(3),
      defaultValue: 0,
      allowNull : false,
    },
    'image': {
      type: DataTypes.STRING(255),
      defaultValue: '',
      allowNull : false,
    }
    'url': {
      type: DataTypes.STRING(255),
      defaultValue: '',
      allowNull : false,
    }
  }, {
    'tableName': 'shop_ad',
    'timestamps' : true,
  });
};