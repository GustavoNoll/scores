import { ModelStatic, UniqueConstraintError } from "sequelize";
import resp from "../utils/resp";
import schema from "./validations/experienceScoreSchema";
import respM from "../utils/respM";
import { ExperienceScoreCreateInterface } from "../interfaces/experienceScoreInterface";
import ExperienceScore from "../database/models/experienceScore";


class ExperienceScoreService {
  private model: ModelStatic<ExperienceScore> = ExperienceScore;

  async get() {
    try {
      const expScores = await this.model.findAll({ where: {} });
      return resp(200, expScores);
    } catch (error) {
      return resp(500, { message: 'Error retrieving expScores', error });
    }
  }


  async create(experienceScoreData: ExperienceScoreCreateInterface) {
    const { error } = schema.create.validate(experienceScoreData);
    if (error) return respM(422, error.message);

    try {
      const existingRecord = await this.model.findOne({
        where: {
          oltId: experienceScoreData.oltId,
          ctoId: experienceScoreData.ctoId
        }
      });

      if (existingRecord) {
        await this.model.update(experienceScoreData, {
          where: {
            id: existingRecord.id
          }
        });
        const updatedRecord = await this.model.findByPk(existingRecord.id);
        return resp(200, updatedRecord);
      } else {
        const createdExperienceScore = await this.model.create({ ...experienceScoreData });
        return resp(201, createdExperienceScore);
      }
    } catch (error) {
      if (error instanceof Error) {
        return resp(500, error.message );
      } else {
        return resp(500, { message: 'An unexpected error occurred' });
      }
    }
  }
}
export default ExperienceScoreService