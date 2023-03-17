'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chats extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Chats.init({
    chat_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
      },
  
    message: {
      type: DataTypes.STRING(5000),
      allowNull : false
    },
  
    // Group_User_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull : false , 
    //   references :{
    //     model : Group_User , 
    //     key : 'id'
    //   }
    // },
  
    username: {
      type: DataTypes.STRING(20)
    },
  
    user_id: {
      type: DataTypes.INTEGER
    },
  
    group_id: {
      type: DataTypes.INTEGER
    },
  
    groupName :{
      type : DataTypes.STRING
    } , 
      
    SentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
  }, {
    sequelize,
    modelName: 'Chats',
    timestamps: false
  });
  return Chats;
};