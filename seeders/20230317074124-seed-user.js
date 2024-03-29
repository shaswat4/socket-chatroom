"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          username: "a",
          password: "a",
        },
        {
          username: "b",
          password: "b",
        },
        {
          username: "abc",
          password: "xyz",
        },
        {
          username: "e",
          password: "e",
        }, 
        {
          username: "x",
          password: "x",
        }, 
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Users", null, {});

    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
