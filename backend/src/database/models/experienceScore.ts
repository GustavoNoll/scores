// models/client.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';
import Client from './client';
import { findWithFallback } from '../../helpers/fallback_search';

class ExperienceScore extends Model {
  declare id: number;
  declare uptime: number;
  declare txPower: number;
  declare cpuUsage: number;
  declare memoryUsage: number;
  declare rxPower: number;
  declare temperature: number;
  declare totalConnectedDevices: number;
  declare averageWorstRssi: number;
  declare connectedDevices5gRatio: number;
  declare oltId: number | null;
  declare ctoId: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;

  static async getByClient(client: Client): Promise<ExperienceScore | null> {
    if (!client) return null;
    return await findWithFallback(ExperienceScore, '', client);
  }
}

ExperienceScore.init({
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  uptime: {
    type: sequelize.FLOAT,
    validate: { min: 0, max: 1 }
  },
  txPower: {
    type: sequelize.FLOAT,
    validate: { min: 0, max: 1 }
  },
  cpuUsage: {
    type: sequelize.FLOAT,
    validate: { min: 0, max: 1 }
  },
  memoryUsage: {
    type: sequelize.FLOAT,
    validate: { min: 0, max: 1 }
  },
  rxPower: {
    type: sequelize.FLOAT,
    validate: { min: 0, max: 1 }
  },
  temperature: {
    type: sequelize.FLOAT,
    validate: { min: 0, max: 1 }
  },
  totalConnectedDevices: {
    type: sequelize.FLOAT,
    validate: { min: 0, max: 1 }
  },
  averageWorstRssi: {
    type: sequelize.FLOAT,
    validate: { min: 0, max: 1 }
  },
  connectedDevices5gRatio: {
    type: sequelize.FLOAT,
    validate: { min: 0, max: 1 }
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
    primaryKey: true,
    allowNull: false,
    type: sequelize.DATE,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  }

}, {
  sequelize: db,
  modelName: 'experience_scores',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeSave: (instance, options) => {
      const total = instance.uptime +
                    instance.txPower +
                    instance.cpuUsage +
                    instance.memoryUsage +
                    instance.rxPower +
                    instance.temperature +
                    instance.totalConnectedDevices +
                    instance.averageWorstRssi +
                    instance.connectedDevices5gRatio;
      const epsilon = 1e-6;
      if (Math.abs(total - 1) > epsilon) {
        throw new Error('The sum of all fields must be equal to 1');
      }
    }
  }
});

export default ExperienceScore;
