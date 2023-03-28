'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "group_attributes",
      [
        {
          Chat_Group_id: 1,
          IsGroup: false,
          name : null , 
          description : null ,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 2,
          IsGroup: true,
          name : "group 1" , 
          description : "contains user 1 and 2",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          Chat_Group_id: 3,
          IsGroup: true,
          name : "group 2" , 
          description : "users 1 , 2 , 3 , 4",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("group_attributes", null, {});
   
  }
};
