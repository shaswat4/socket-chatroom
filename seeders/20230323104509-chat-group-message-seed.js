"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "chat_group_messages",
      [
        {
          Chat_Group_id: 1,
          user_id: 1,
          message: "msg 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 1,
          user_id: 1,
          message: "msg 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 1,
          user_id: 2,
          message: "msg 3",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 2,
          user_id: 1,
          message: "msg 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 2,
          user_id: 2,
          message: "msg 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 2,
          user_id: 2,
          message: "msg 3",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("chat_group_messages", null, {});

    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
