"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("Message_files", "file_path", {
      type: Sequelize.STRING,
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("Message_files", "file_path");
  },
};
