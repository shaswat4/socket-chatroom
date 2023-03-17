"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Groups",
      [
        {
          name: "Home",
          description: "",
        },
        {
          name: "Group 1",
          description: "",
        },
        {
          name: "Group 2",
          description: "dacva nujnjns jnsj njans aj n",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete("Groups", null, {});

    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
