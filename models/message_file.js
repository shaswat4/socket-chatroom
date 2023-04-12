'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message_file extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Message_file.init({
    message_id: DataTypes.INTEGER,
    file_name: DataTypes.STRING,
    file_size: DataTypes.BIGINT,
    content_type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Message_file',
  });
  return Message_file;
};