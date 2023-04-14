'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat_Group_message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Datatypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Chat_Group_message.init({

    Chat_Group_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    user_id: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    message: {
      allowNull: true,
      type: DataTypes.STRING(5000)
    },

  }, {
    sequelize,
    modelName: 'Chat_Group_message',
  });
  return Chat_Group_message;
};