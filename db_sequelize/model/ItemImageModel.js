'use strict';
module.exports = function (sequelize, DataTypes) {
  return sequelize.define('shop_item_image', {
    'id':{
      type:DataTypes.BIGINT(11), 
      autoIncrement:true, 
      primaryKey : true, 
    },
    'item_id' : {
      type : DataTypes.BIGINT(11),
      allowNull : false,
      defaultValue : 0,
      unique : 'item_image',
    },
    'image_type' : {
      type : DataTypes.BIGINT(3),
      allowNull : false,
      defaultValue : "",
      comment : '图片的类型,1是显示的物品图片,2是显示在推广页里的图片,3 是细节图片',
      unique : 'item_image',
    },
    'index': { 
      type: DataTypes.BIGINT(3),  
      allowNull: false,
      comment:'从0开始',
      defaultValue : 0, 
      unique : 'item_image',
    },
    'image' : {
      type:DataTypes.STRING,
      allowNull:false,
      defaultValue:0
    }
  },{
  'tableName' : 'shop_item_image',
  'hooks' : {
      'beforeUpdate' : function(instance, options){
          console.log(instance);
      }
  },
  });
};
