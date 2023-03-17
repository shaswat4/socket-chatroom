"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Groups", {
      group_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING(40),
        allowNull: false,
      },

      description: {
        type: Sequelize.STRING(500),
        defaultValue: "",
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Groups");
  },
};
