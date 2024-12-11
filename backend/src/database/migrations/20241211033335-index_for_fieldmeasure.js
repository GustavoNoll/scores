'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('field_measures', 
      ['device_id', 'field', 'created_at'],
      {
        name: 'idx_field_measures_device_field_date',
        // fields já estão incluídos na query
        // ajuda em: WHERE device_id = X AND field = Y ORDER BY created_at DESC
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('field_measures', 'idx_field_measures_device_field_date');
  }
};