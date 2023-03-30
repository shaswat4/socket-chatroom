'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Chat_groups', 'admin', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Chat_groups', 'admin');

  }
};
