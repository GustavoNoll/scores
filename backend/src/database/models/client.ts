// models/client.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';
import FieldMeasure from './fieldMeasure';
import DeviceScore from './deviceScore';
import Device from './device';
import Cto from './cto';
import Olt from './olt';



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
        this.setDataValue('mac', value.toLowerCase());
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

Client.hasMany(DeviceScore, {
  as: 'device_scores',
  foreignKey: 'clientId'
});
DeviceScore.belongsTo(Client)

Client.hasMany(FieldMeasure, {
  as: 'field_measures',
  foreignKey: 'clientId'
});
FieldMeasure.belongsTo(Client)

Client.hasOne(Device, {
  as: 'device',
  foreignKey: 'clientId'
});
Device.belongsTo(Client);


Cto.hasMany(Client, {
  as: 'clients',
  foreignKey: 'ctoId'
});
Client.belongsTo(Cto);

Olt.hasMany(Client, {
  as: 'clients',
  foreignKey: 'oltId'
});
Client.belongsTo(Olt);

export default Client;
