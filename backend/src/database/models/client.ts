// models/client.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';
import Device from './device';



class Client extends Model {
  declare id: number;
  declare integrationId: string;
  declare pppoeUsername: string;
  declare latitude: number;
  declare longitude: number;
  declare name: string;
  declare serialNumber: string;
  declare mac: string;
  declare ctoId: number;
  declare oltId: number;
  declare active: boolean;
  declare activeTimestamp: Date;
  declare createdAt: Date;
  declare updatedAt: Date;


}

Client.init({
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  integrationId: {
    type: sequelize.STRING,
    unique: true,
    allowNull: false,
  },
  pppoeUsername: {
    type: sequelize.STRING,
    allowNull: true,
  },
  latitude: {
    type: sequelize.FLOAT,
    allowNull: false,
  },
  longitude: {
    type: sequelize.FLOAT,
    allowNull: false,
  },
  name: {
    type: sequelize.STRING,
    allowNull: true,
  },
  serialNumber: {
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
  ctoId: {
    type: sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'ctos', // Nome da tabela Cto
      key: 'id'
    },
  },
  oltId: {
    type: sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'olts', // Nome da tabela Olt
      key: 'id'
    },
  },
  active: {
    allowNull: false,
    type: sequelize.BOOLEAN,
    defaultValue: true,
  },
  activeTimestamp: {
    allowNull: false,
    type: sequelize.DATE,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
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
  tableName: 'clients',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeUpdate: (client: Client, options: any) => {
      if (client.changed('active')) {
        client.activeTimestamp = new Date();
      }
    }
  }
});

setTimeout(() => {
  Client.hasOne(Device, { as: 'device', foreignKey: 'clientId' });
}, 0);

export default Client;
