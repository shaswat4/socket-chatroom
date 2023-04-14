"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.changeColumn("Chat_Group_messages", "message", {
      type: Sequelize.STRING(5000),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.changeColumn("Chat_Group_messages", "message", {
      type: Sequelize.STRING(5000),
      allowNull: false,
    });
  },
};
