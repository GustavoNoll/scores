// models/client.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';

import Client from './client';
import Device from './device';

class FieldScoreRule extends Model {
  declare id: number;
  declare field: string;
  declare goodThreshold: number;
  declare goodThresholdAdditional: number | null;
  declare criticalThreshold: number;
  declare criticalThresholdAdditional: number | null;
  declare functionType: string;
  declare oltId: number | null;
  declare ctoId: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;

  static async getFieldScoreRuleForDevice(device: Device, field: string): Promise<FieldScoreRule | null> {
    try {
      const client = await Client.findByPk(device.clientId);

      if (!client) {
        return null; // Cliente não encontrado
      }

      // Obter a FieldScoreRule
      const fieldScoreRule = await FieldScoreRule.findOne({
        where: {
          field: field,
          oltId: client.oltId,
          ctoId: client.ctoId
        }
      });
      return fieldScoreRule;
    } catch (error) {
      console.error('Error retrieving FieldScoreRule:', error);
      return null;
    }
  }
}

FieldScoreRule.init({
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  field: {
    type: sequelize.TEXT,
    allowNull: false,
  },
  goodThreshold: {
    type: sequelize.FLOAT,
    allowNull: false,
  },
  goodThresholdAdditional: {
    type: sequelize.FLOAT,
    allowNull: true,
  },
  criticalThreshold: {
    type: sequelize.FLOAT,
    allowNull: false,
  },
  criticalThresholdAdditional: {
    type: sequelize.FLOAT,
    allowNull: true,
  },
  functionType: {
    type: sequelize.TEXT,
    allowNull: false,
  },
  oltId: {
    type: sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'olts', // Nome da tabela Olt
      key: 'id'
    },
    onDelete: 'CASCADE',
  },
  ctoId: {
    type: sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'ctos', // Nome da tabela Cto
      key: 'id'
    },
    onDelete: 'CASCADE',
  },
  createdAt: {
    allowNull: false,
    type: sequelize.DATE,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updatedAt: {
    allowNull: false,
    type: sequelize.DATE,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  }
}, {
  sequelize: db,
  tableName: 'field_score_rules',
  timestamps: true,
  underscored: true
});

export default FieldScoreRule;
