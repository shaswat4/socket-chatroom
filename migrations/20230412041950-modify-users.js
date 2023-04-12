"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "username", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING(20),
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "type", {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: "l",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "username", {
      type: Sequelize.STRING(20),
      allowNull: false,
    });

    await queryInterface.changeColumn("Users", "password", {
      type: Sequelize.STRING(20),
      allowNull: false,
    });

    queryInterface.removeColumn("tableName", "type");
  },
};
