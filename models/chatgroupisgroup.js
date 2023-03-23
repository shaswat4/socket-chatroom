'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatGroupIsGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ChatGroupIsGroup.init({
    
    Chat_Group_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    IsGroup: {
      allowNull: false,
      type: DataTypes.BOOLEAN
    },
  }, {
    sequelize,
    modelName: 'ChatGroupIsGroup',
  });
  return ChatGroupIsGroup;
};