// models/FieldScore.ts
import { Model } from 'sequelize';
import db from '.';
import sequelize from 'sequelize';
import { SCORE_FIELDS } from '../../constants/fieldConstants';

class ClientScore extends Model {
  declare id: number;
  declare clientId: number;
  declare score: number;
  declare partial: boolean;
  declare fieldScoreSnapshot: object;
  declare experienceScoreSnapshot: object;
  declare createdAt: Date;
  declare updatedAt: Date;


  /**
   * Cria e salva um ClientScore.
   * @param clientId - ID do cliente.
   * @param score - Valor do score calculado.
   * @param fieldScores - Objeto JSON contendo os fieldScores.
   * @param experienceScore - Objeto JSON contendo os experienceScores e pesos.
   * @returns ClientScore criado.
   */
  static async createScore(
    clientId: number,
    score: number,
    fieldScores: { [key: string]: number },
    experienceScore: { [key: string]: number },
  ): Promise<ClientScore> {
    const fieldCount = Object.keys(fieldScores).length;

    const partial = fieldCount < SCORE_FIELDS.length;

    const clientScore = await ClientScore.create({
      clientId,
      score,
      partial,
      fieldScoreSnapshot: fieldScores,
      experienceScoreSnapshot: experienceScore
    });

    return clientScore;
  }
}

ClientScore.init({
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
  score: {
    type: sequelize.FLOAT,
    allowNull: false,
  },
  partial: {
    type: sequelize.BOOLEAN,
    defaultValue: false,
  },
  fieldScoreSnapshot: {
    type: sequelize.JSON,
    allowNull: true,
  },
  experienceScoreSnapshot: {
    type: sequelize.JSON,
    allowNull: true,
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
  tableName: 'client_scores',
  timestamps: true,
  underscored: true,
});


export default ClientScore;
