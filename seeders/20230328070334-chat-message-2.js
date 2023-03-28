"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "chat_group_messages",
      [
        {
          Chat_Group_id: 3,
          user_id: 1,
          message: "message sent by 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          Chat_Group_id: 3,
          user_id: 2,
          message: "message sent by 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          Chat_Group_id: 3,
          user_id: 3,
          message: "message sent by 3",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          Chat_Group_id: 3,
          user_id: 4,
          message: "message sent by 4",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("chat_group_messages", null, {});
  },
};
