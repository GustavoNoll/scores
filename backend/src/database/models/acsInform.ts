// models/acsInform.ts
import { Model } from 'sequelize';
import sequelize from 'sequelize';
import db from '.';

class AcsInform extends Model {
  declare id: number;
  declare deviceTag: string;
  declare jsonData: any;
  declare createdAt: Date;
}

AcsInform.init({
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  deviceTag: {
    type: sequelize.STRING,
    allowNull: false,
  },
  jsonData: {
    type: sequelize.JSONB,
    allowNull: false,
  },
  createdAt: {
    allowNull: false,
    type: sequelize.DATE,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
  },
}, {
  sequelize: db,
  tableName: 'acs_informs',
  createdAt: true,
  updatedAt: false,
  underscored: true,
});

export default AcsInform;