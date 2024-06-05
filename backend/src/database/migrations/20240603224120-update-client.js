'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('clients', 'serial_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('clients', 'mac', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('clients', 'cto_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'ctos', // Nome da tabela Cto
        key: 'id'
      },
    });
    await queryInterface.addColumn('clients', 'olt_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'olts', // Nome da tabela Olt
        key: 'id'
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('clients', 'serial_number');
    await queryInterface.removeColumn('clients', 'mac');
    await queryInterface.removeColumn('clients', 'cto_id');
    await queryInterface.removeColumn('clients', 'olt_id');
  }
};
