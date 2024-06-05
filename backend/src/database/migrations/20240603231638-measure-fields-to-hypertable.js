'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      SELECT create_hypertable('field_measures', by_range('updated_at', INTERVAL '7 days'));
    `);

  },

  async down (queryInterface, Sequelize) {
  }
};
