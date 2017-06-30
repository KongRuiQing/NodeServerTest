'use strict';
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('group_msg', {
    'id': {
      type: DataTypes.BIGINT(11),
      autoIncrement: true,
      primaryKey: true,
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
    'image1' {
      type: DataTypes.STRING(512),
      defaultValue: "",
      allowNull: false,
    },
    'image2' {
      type: DataTypes.STRING(512),
      defaultValue: "",
      allowNull: false,
    },
    'image3' {
      type: DataTypes.STRING(512),
      defaultValue: "",
      allowNull: false,
    },
    'image4' {
      type: DataTypes.STRING(512),
      defaultValue: "",
      allowNull: false,
    },
    'image5' {
      type: DataTypes.STRING(512),
      defaultValue: "",
      allowNull: false,
    },
    'image6' {
      type: DataTypes.STRING(512),
      defaultValue: "",
      allowNull: false,
    },
    'image7' {
      type: DataTypes.STRING(512),
      defaultValue: "",
      allowNull: false,
    },
    'image8' {
      type: DataTypes.STRING(512),
      defaultValue: "",
      allowNull: false,
    },
    'image9' {
      type: DataTypes.STRING(512),
      defaultValue: "",
      allowNull: false,
    }
  }, {
    'tableName': 'group_msg',
    'updatedAt' : false,
  });
};
