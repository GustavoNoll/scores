// models/fieldMeasure.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';

class FieldMeasure extends Model {
  declare id: number;
  declare clientId: number;
  declare deviceId: number;
  declare field: string;
  declare value: number;
  declare createdAt: Date;
  declare updatedAt: Date;

  static groupMeasuresByDay(measures: Array<{ value: number, createdAt: Date }>): Map<string, number[]> {
    const measuresByDay = new Map<string, number[]>();

    measures.forEach(measure => {
      const measureDate = new Date(measure.createdAt).toISOString().split('T')[0];  // Group by date (YYYY-MM-DD)

      if (measure.value !== null) {
        if (!measuresByDay.has(measureDate)) {
          measuresByDay.set(measureDate, []);
        }
        measuresByDay.get(measureDate)?.push(measure.value);
      }
    });

    return measuresByDay;
  }
}

FieldMeasure.init({
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  clientId: {
    type: sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  deviceId: {
    type: sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'devices',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  field: {
    type: sequelize.TEXT,
    allowNull: false,
  },
  value: {
    type: sequelize.FLOAT,
    allowNull: true,
  },
  createdAt: {
    allowNull: false,
    type: sequelize.DATE,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updatedAt: {
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

export default FieldMeasure;