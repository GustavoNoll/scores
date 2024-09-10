// models/device.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';
import Client from './client';


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
  declare clientId: number;
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
    set(value: string) {
      if (value){
        const formattedValue = value.toLowerCase().replace(/[^a-f0-9]/g, '').match(/.{1,2}/g)
        if (formattedValue) {
          this.setDataValue('mac', formattedValue.join(':'));
        }
      }
    },
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
  modelName: 'Device',
  timestamps: true,
  underscored: true,
});

setTimeout(() => {
  Device.belongsTo(Client, {as: 'client'});;
}, 0);
export default Device;