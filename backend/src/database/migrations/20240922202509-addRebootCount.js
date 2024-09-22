'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('experience_scores', 'reboot_count', {
      type: Sequelize.FLOAT,
      validate: { min: 0, max: 1 }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('experience_scores', 'reboot_count');
  }
};
