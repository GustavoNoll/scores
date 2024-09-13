// models/client.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';

import Client from './client';
import Device from './device';
import { findWithFallback } from '../../helpers/fallback_search';

class FieldScoreRule extends Model {
  declare id: number;
  declare field: string;
  declare goodThresholdLow: number | null;
  declare goodThresholdHigh: number | null;
  declare criticalThresholdLow: number | null;
  declare criticalThresholdHigh: number | null;
  declare functionType: string;
  declare oltId: number | null;
  declare ctoId: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;

  static async getFieldScoreRuleForDevice(device: Device, field: string): Promise<FieldScoreRule | null> {
    const client = await Client.findByPk(device.clientId);
    if (!client) return null;
    return await findWithFallback(FieldScoreRule, field, client);
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
  goodThresholdLow: {
    type: sequelize.FLOAT,
    allowNull: false,
  },
  goodThresholdHigh: {
    type: sequelize.FLOAT,
    allowNull: true,
  },
  criticalThresholdLow: {
    type: sequelize.FLOAT,
    allowNull: false,
  },
  criticalThresholdHigh: {
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
