// models/client.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';
import Olt from './olt';
import Cto from './cto';


class Client extends Model {
  declare id: number;
  declare pppoeUsername: string;
  declare latitude: number;
  declare longitude: number;
  declare name: string;
  declare serialNumber: string;
  declare mac: string;
  declare ctoId: number;
  declare oltId: number;
}

Client.init({
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  pppoe_username: {
    type: sequelize.STRING,
    allowNull: false,
  },
  latitude: {
    type: sequelize.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: sequelize.FLOAT,
    allowNull: true,
  },
  name: {
    type: sequelize.STRING,
    allowNull: false,
  },
  serialNumber: {
    type: sequelize.STRING,
    allowNull: true,
  },
  mac: {
    type: sequelize.STRING,
    allowNull: true,
  },
  cto_id: {
    type: sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'ctos', // Nome da tabela Cto
      key: 'id'
    },
  },
  olt_id: {
    type: sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'olts', // Nome da tabela Olt
      key: 'id'
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
  tableName: 'clients',
  timestamps: true,
  underscored: true
});

export default Client;
