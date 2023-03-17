'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Groups extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Groups.init({
    group_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true , 
      allowNull : false
    },
  
    name: {
      type: DataTypes.STRING(40),
      allowNull : false
    },
  
    description: {
      type: DataTypes.STRING(500), 
      defaultValue : ''
    }
  }, {
    sequelize,
    modelName: 'Groups',
    timestamps : flase
  });
  return Groups;
};