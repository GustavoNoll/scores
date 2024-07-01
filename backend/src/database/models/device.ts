// models/device.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';
import DeviceScore from './deviceScore';
import FieldMeasure from './fieldMeasure';
import AcsInform from './acsInform';


class Device extends Model {
  declare id: number;
  declare deviceTag: string;
  declare serialNumber: string;
  declare pppoeUsername: string;
  declare mac: string;
  declare manufacturer: string;
  declare oui: string;
  declare productClass: string;
  declare modelName: string;
  declare hardwareVersion: string;
  declare softwareVersion: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

Device.init({
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  deviceTag: {
    type: sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  serialNumber: {
    type: sequelize.STRING,
    allowNull: true,
  },
  manufacturer: {
    type: sequelize.STRING,
    allowNull: false,
  },
  oui: {
    type: sequelize.STRING,
    allowNull: false,
  },
  productClass: {
    type: sequelize.STRING,
    allowNull: false,
  },
  modelName: {
    type: sequelize.STRING,
    allowNull: false,
  },
  hardwareVersion: {
    type: sequelize.STRING,
    allowNull: false,
  },
  softwareVersion: {
    type: sequelize.STRING,
    allowNull: false,
  },
  pppoeUsername: {
    type: sequelize.STRING,
    allowNull: true,
  },
  mac: {
    type: sequelize.STRING,
    allowNull: true,
  },
  clientId: {
    type: sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'clients',
      key: 'id',
    },
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
  tableName: 'devices',
  timestamps: true,
  underscored: true,
});

Device.hasMany(DeviceScore, {
  as: 'device_scores',
  foreignKey: 'deviceId'
});
DeviceScore.belongsTo(Device);

Device.hasMany(FieldMeasure, {
  as: 'field_measures',
  foreignKey: 'deviceId'
});
FieldMeasure.belongsTo(Device);

Device.hasMany(AcsInform, {
  as: 'acs_informs',
  foreignKey: 'deviceTag'
});
AcsInform.belongsTo(Device, {
  foreignKey: 'deviceTag',
});

export default Device;