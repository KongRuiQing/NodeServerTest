'use strict';
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_favorites', {
    'id': {
      type: DataTypes.BIGINT(11),
      autoIncrement: true,
      primaryKey: true,
    },
    'uid': {
      type: DataTypes.BIGINT(11),
      defaultValue: 0,
      allowNull : false,
      unique : 'favorite_group',
    },
    'item_id': {
      type: DataTypes.BIGINT(11),
      defaultValue: 0,
      allowNull : false,
      unique : 'favorite_group',
    }
  }, {
    'tableName': 'user_favorites',
  });
};