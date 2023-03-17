'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Group_Users', [
      {
      isAdmin : true, 
      group_id : 1 , 
      user_id : 1 , 
      username : 'a'
    },{
      isAdmin : false, 
      group_id : 2 , 
      user_id : 3 , 
      username : 'abc'
    },{
      isAdmin : false, 
      group_id : 1 , 
      user_id : 3 , 
      username : 'abc'
    }
  
  ], {});

  

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

  async down (queryInterface, Sequelize) {

    return queryInterface.bulkDelete("Group_Users", null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
