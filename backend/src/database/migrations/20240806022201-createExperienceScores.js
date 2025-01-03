'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('experience_scores', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      uptime: {
        type: Sequelize.FLOAT,
        validate: { min: 0, max: 1 }
      },
      tx_power: {
        type: Sequelize.FLOAT,
        validate: { min: 0, max: 1 }
      },
      cpu_usage: {
        type: Sequelize.FLOAT,
        validate: { min: 0, max: 1 }
      },
      memory_usage: {
        type: Sequelize.FLOAT,
        validate: { min: 0, max: 1 }
      },
      rx_power: {
        type: Sequelize.FLOAT,
        validate: { min: 0, max: 1 }
      },
      temperature: {
        type: Sequelize.FLOAT,
        validate: { min: 0, max: 1 }
      },
      total_connected_devices: {
        type: Sequelize.FLOAT,
        validate: { min: 0, max: 1 }
      },
      average_worst_rssi: {
        type: Sequelize.FLOAT,
        validate: { min: 0, max: 1 }
      },
      connected_devices5g_ratio: {
        type: Sequelize.FLOAT,
        validate: { min: 0, max: 1 }
      },
      protocol_count: {
        type: Sequelize.FLOAT,
        validate: { min: 0, max: 1 }
      },
      massive_event_count: {
        type: Sequelize.FLOAT,
        validate: { min: 0, max: 1 }
      },
      olt_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'olts', // Nome da tabela Olt
          key: 'id'
        },
        onDelete: 'CASCADE',
      },
      cto_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'ctos', // Nome da tabela Cto
          key: 'id'
        },
        onDelete: 'CASCADE',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('experience_scores');

  }
};
