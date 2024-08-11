import { ModelStatic, Sequelize, UniqueConstraintError } from "sequelize";
import resp from "../utils/resp";
import schema from "./validations/ctoSchema";
import respM from "../utils/respM";
import Cto from "../database/models/cto";
import { CtoCreateInterface, CtoUpdateInterface } from "../interfaces/ctoInterface";

class CtoService {
  private model: ModelStatic<Cto> = Cto;

  async get(cto?: any) {
    try {
      const ctos = await this.model.findAll({ where: cto });
      return resp(200, ctos);
    } catch (error) {
      // Lide com erros conforme necessário
      return resp(500, { message: 'Error retrieving Ctos', error });
    }
  }

  async create(cto: CtoCreateInterface) {
    const { error } = schema.create.validate(cto)
    if (error) return respM(422, error.message);
    try {
      const createdCto = await this.model.create({ ...cto })
      return resp(201, createdCto)
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return respM(409, 'A cto with the provided integration ID already exists.');
      }
      return resp(500, { message: 'Error creating Cto', error });
    }
  }

  async update(integrationId: string, cto: CtoUpdateInterface) {
    const { error } = schema.update.validate(cto);
    if (error) return respM(422, error.message);

    try {
      const existingCto = await this.model.findOne({ where: { integrationId } });
      if (!existingCto) return respM(404, 'CTO not found');

      await existingCto.update({ ...cto });

      return resp(200, existingCto);
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return respM(409, 'A CTO with the provided integration ID already exists.');
      }
      return resp(500, { message: 'Error updating CTO', error });
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
                    WHERE "clients"."cto_id" = "Cto"."id"
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
      return resp(500, { message: 'Error retrieving average scores by CTO', error });
    }
  }
}
export default CtoService