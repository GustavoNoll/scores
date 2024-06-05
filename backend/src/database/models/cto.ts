// models/cto.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';
import Client from './client';

class Cto extends Model {
  declare id: number;
  declare description: string;
  declare latitude: number;
  declare longitude: number;
}

Cto.init({
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
  tableName: 'ctos',
  timestamps: true,
  underscored: true
});

Cto.hasMany(Client, {
  as: 'clients',
  foreignKey: 'ctoId'
})
export default Cto;
