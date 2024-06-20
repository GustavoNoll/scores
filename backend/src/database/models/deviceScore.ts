// models/deviceScore.ts
import { Model } from 'sequelize';
import db from '.';
import sequelize from 'sequelize';
import Device from './device';

class DeviceScore extends Model {
  declare id: number;
  declare deviceId: number;
  declare field: string;
  declare value: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

DeviceScore.init({
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  deviceId: {
    type: sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'devices',
      key: 'id',
    },
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
    allowNull: false,
    type: sequelize.DATE,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  },
}, {
  sequelize: db,
  tableName: 'device_scores',
  timestamps: true,
  underscored: true,
});

// Associações (descomente e ajuste conforme necessário)
/*DeviceScore.belongsTo(Device, {
  foreignKey: 'deviceId',
  as: 'device'
});*/

export default DeviceScore;
