'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.changeColumn('Group_attributes', 'Chat_Group_id', {
      type: Sequelize.INTEGER,
      autoIncrement: true
    });

  },

  async down (queryInterface, Sequelize) {

    await queryInterface.changeColumn('Group_attributes', 'Chat_Group_id', {
      type: Sequelize.INTEGER,
      autoIncrement: false
    });

  }
};
