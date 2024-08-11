// models/FieldScore.ts
import { Model } from 'sequelize';
import db from '.';
import sequelize from 'sequelize';

class FieldScore extends Model {
  declare id: number;
  declare deviceId: number;
  declare clientId: number;
  declare field: string;
  declare value: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

FieldScore.init({
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  clientId: {
    type: sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  deviceId: {
    type: sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'devices',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  field: {
    type: sequelize.TEXT,
    allowNull: false,
  },
  value: {
    type: sequelize.FLOAT,
    allowNull: false,
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
  },
}, {
  sequelize: db,
  tableName: 'field_scores',
  timestamps: true,
  underscored: true,
});


export default FieldScore;
