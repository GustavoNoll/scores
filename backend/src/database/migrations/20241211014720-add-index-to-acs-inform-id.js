'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('acs_informs', ['id'], {
      name: 'idx_acs_informs_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('acs_informs', 'idx_acs_informs_id');
  }
};