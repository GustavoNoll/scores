// models/fieldMeasure.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';
import Device from './device';
import Client from './client';

class FieldMeasure extends Model {
  declare id: number;
  declare clientId: number;
  declare deviceId: number;
  declare field: string;
  declare value: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

FieldMeasure.init({
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
    type: sequelize.STRING,
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
    primaryKey: true,
    allowNull: false,
    type: sequelize.DATE,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  }
}, {
  sequelize: db,
  tableName: 'field_measures',
  timestamps: true,
  underscored: true
});

export default FieldMeasure;