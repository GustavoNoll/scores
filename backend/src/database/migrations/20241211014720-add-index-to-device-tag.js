'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('devices', ['device_tag'], {
      name: 'idx_devices_tag'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('devices', 'idx_devices_tag');
  }
};