// models/olt.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';
import Client from './client';

class Olt extends Model {
  declare id: number;
  declare description: string;
  declare latitude: number;
  declare longitude: number;
}

Olt.init({
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
  tableName: 'olts',
  timestamps: true,
  underscored: true
});

Olt.hasMany(Client, {
  as: 'clients',
  foreignKey: 'oltId'
})
export default Olt;
