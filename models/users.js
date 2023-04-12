"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Datatypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users.init(
    {
      user_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      username: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: "l",
      },
    },
    {
      sequelize,
      modelName: "Users",
      timestamps: false,
    }
  );
  return Users;
};
