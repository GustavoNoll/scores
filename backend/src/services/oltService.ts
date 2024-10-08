import { ModelStatic, Sequelize, UniqueConstraintError } from "sequelize";
import resp from "../utils/resp";
import schema from "./validations/oltSchema";
import respM from "../utils/respM";
import Olt from "../database/models/olt";
import { OltCreateInterface, OltUpdateInterface } from "../interfaces/oltInterface";


class OltService {
  private model: ModelStatic<Olt> = Olt;

  async get(olt?: any) {
    try {
      const olts = await this.model.findAll({ where: olt });
      return resp(200, olts);
    } catch (error) {
      // Lide com erros conforme necessário
      return resp(500, { message: 'Error retrieving OLTS', error });
    }
  }


  async create(olt: OltCreateInterface) {
    const { error } = schema.create.validate(olt)
    if (error) return respM(422, error.message);
    try {
      const createdOlt = await this.model.create({ ...olt })
      return resp(201, createdOlt)
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return respM(409, 'A olt with the provided integration ID already exists.');
      }
      return resp(500, { message: 'Error creating Olt', error });
    }
  }

  async update(integrationId: string, olt: OltUpdateInterface) {
    const { error } = schema.oltUpdate.validate(olt);
    if (error) return respM(422, error.message);

    try {
      const existingOlt = await this.model.findOne({ where: { integrationId } });
      if (!existingOlt) return respM(404, 'OLT not found');
      await existingOlt.update({ ...olt });

      return resp(200, existingOlt);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return respM(409, 'An OLT with the provided integration ID already exists.');
      }
      return resp(500, { message: 'Error updating OLT', error });
    }
  }
  async getAverageScores() {
    try {
      const results = await this.model.findAll({
        attributes: [
          'id',
          'description',
          'latitude',
          'longitude',
          [
            Sequelize.literal(`
              (
                SELECT AVG(subquery."average_score")
                FROM (
                  SELECT AVG("value") AS "average_score"
                  FROM "field_scores"
                  WHERE "field_scores"."client_id" IN (
                    SELECT "id"
                    FROM "clients"
                    WHERE "clients"."olt_id" = "Olt"."id"
                  )
                  GROUP BY "field_scores"."client_id"
                ) AS subquery
              )
            `),
            'average_score'
          ]
        ],
        raw: true
      });

      return resp(200, results);
    } catch (error) {
      return resp(500, { message: 'Error retrieving average scores by OLT', error });
    }
  }
}
export default OltService