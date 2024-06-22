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
  device_tag: {
    type: sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  serial_number: {
    type: sequelize.STRING,
    allowNull: true,
  },
  manufacturer: {
    type: sequelize.STRING,
    allowNull: true,
  },
  oui: {
    type: sequelize.STRING,
    allowNull: true,
  },
  product_class: {
    type: sequelize.STRING,
    allowNull: true,
  },
  model_name: {
    type: sequelize.STRING,
    allowNull: true,
  },
  hardware_version: {
    type: sequelize.STRING,
    allowNull: true,
  },
  software_version: {
    type: sequelize.STRING,
    allowNull: true,
  },
  pppoe_username: {
    type: sequelize.STRING,
    allowNull: true,
  },
  mac: {
    type: sequelize.STRING,
    allowNull: true,
  },
  client_id: {
    type: sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'clients',
      key: 'id',
    },
  },
  created_at: {
    allowNull: false,
    type: sequelize.DATE,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updated_at: {
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
AcsInform.belongsTo(Device);

export default Device;