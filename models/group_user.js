'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Group_User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Group_User.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
      },
  
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
  
    group_id : {
      type: DataTypes.INTEGER,
      allowNull : false , 
      references :{
        model : Groups , 
        key : 'group_id'
      }
    }, 
  
    user_id : {
      type: DataTypes.INTEGER,
      allowNull : false , 
      references :{
        model : Users , 
        key : 'user_id'
      }
    },
  
    username: {
      type: DataTypes.STRING(20),
    },
  }, {
    sequelize,
    modelName: 'Group_User',
  });
  return Group_User;
};