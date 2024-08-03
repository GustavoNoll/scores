// models/cto.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';
import Client from './client';
import FieldScoreRule from './fieldScoreRule';

class Cto extends Model {
  declare id: number;
  declare integrationId: string;
  declare description: string;
  declare latitude: number;
  declare longitude: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Cto.init({
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  integrationId: {
    type: sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  description: {
    type: sequelize.STRING,
    allowNull: false,
  },
  latitude: {
    type: sequelize.FLOAT,
    allowNull: false,
  },
  longitude: {
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
  }
}, {
  sequelize: db,
  tableName: 'ctos',
  timestamps: true,
  underscored: true
});

export default Cto;
