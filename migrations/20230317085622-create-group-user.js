"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Group_Users", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      isAdmin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      joinedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Groups",
          key: "group_id",
        },
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
      },

      username: {
        type: Sequelize.STRING(20),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Group_Users");
  },
};
