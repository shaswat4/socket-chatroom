'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Chats', {
      chat_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
        },
    
      message: {
        type: Sequelize.STRING(5000),
        allowNull : false
      },
    
      // Group_User_id: {
      //   type: Sequelize.INTEGER,
      //   allowNull : false , 
      //   references :{
      //     model : Group_User , 
      //     key : 'id'
      //   }
      // },
    
      username: {
        type: Sequelize.STRING(20)
      },
    
      user_id: {
        type: Sequelize.INTEGER
      },
    
      group_id: {
        type: Sequelize.INTEGER
      },
    
      groupName :{
        type : Sequelize.STRING
      } , 
        
      SentAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Chats');
  }
};