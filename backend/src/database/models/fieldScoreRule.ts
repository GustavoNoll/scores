// models/client.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';
import Olt from './olt';
import Cto from './cto';

class FieldScoreRule extends Model {
  declare id: number;
  declare field: string;
  declare goodThreshold: number;
  declare mediumThreshold: number;
  declare poorThreshold: string;
  declare criticalThreshold: string;
  declare progressionRate: string;
  declare oltId: number | null;
  declare ctoId: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;
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
  mediumThreshold: {
    type: sequelize.FLOAT,
    allowNull: false,
  },
  poorThreshold: {
    type: sequelize.FLOAT,
    allowNull: false,
  },
  criticalThreshold: {
    type: sequelize.FLOAT,
    allowNull: false,
  },
  progressionRate: {
    type: sequelize.FLOAT,
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
