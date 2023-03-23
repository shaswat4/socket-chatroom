"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "chat_group_descriptions",
      [
        {
          Chat_Group_id: 2,
          description: "group 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 3,
          description: "group 3",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("chat_group_descriptions", null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
