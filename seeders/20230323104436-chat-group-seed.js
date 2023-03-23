"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Chat_Groups",
      [
        {
          Chat_Group_id: 1,
          user_id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 1,
          user_id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 2,
          user_id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 2,
          user_id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 3,
          user_id: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 3,
          user_id: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 3,
          user_id: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 3,
          user_id: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Chat_Groups", null, {});

    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
