'use strict';
'GroupChatModel'
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('group_chat', {
    'id': {
      type: DataTypes.BIGINT(11),
      autoIncrement: true,
      primaryKey: true,
    },
    'uid': {
      type: DataTypes.BIGINT(11),
      defaultValue: 0,
      allowNull: false,
    },
    'shop_id': {
      type: DataTypes.BIGINT(11),
      defaultValue: 0,
      allowNull: false,
    },
    'msg': {
      type: DataTypes.STRING(1024),
      defaultValue: "",
      allowNull: false,
    },
  }, {
    'tableName': 'group_chat',
    'updatedAt': false,
  });
};