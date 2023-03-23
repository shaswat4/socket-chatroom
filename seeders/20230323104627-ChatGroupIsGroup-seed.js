"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "chatgroupisgroups",

      [
        {
          Chat_Group_id: 1,
          IsGroup: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 2,
          IsGroup: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 3,
          IsGroup: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],

      {}
    );

    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("chatgroupisgroups", null, {});

    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
