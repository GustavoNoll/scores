// models/fieldMeasure.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';
import Device from './device';

class FieldMeasure extends Model {
  declare id: number;
  declare deviceId: number;
  declare field: string;
  declare value: number;
  declare created_at: Date;
  declare updated_at: Date;
}

FieldMeasure.init({
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  device_id: {
    type: sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'devices',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  field: {
    type: sequelize.STRING,
    allowNull: false,
  },
  value: {
    type: sequelize.FLOAT,
    allowNull: false,
  },
  created_at: {
    allowNull: false,
    type: sequelize.DATE,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updated_at: {
    primaryKey: true,
    allowNull: false,
    type: sequelize.DATE,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  }
}, {
  sequelize: db,
  tableName: 'field_measures',
  timestamps: true,
  underscored: true
});

FieldMeasure.belongsTo(Device);

export default FieldMeasure;