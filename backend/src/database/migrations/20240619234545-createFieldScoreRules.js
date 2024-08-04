'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('field_score_rules', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      field: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      good_threshold: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      good_threshold_additional: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      critical_threshold: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      critical_threshold_additional: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      function_type: {
        type: Sequelize.STRING,
        allowNull: false,
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
    await queryInterface.dropTable('field_score_rules');
  }
};
