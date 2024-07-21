import { ModelStatic, UniqueConstraintError } from "sequelize";
import resp from "../utils/resp";
import schema from "./validations/fieldScoreRuleSchema";
import respM from "../utils/respM";
import FieldScoreRule from "../database/models/olt";
import { FieldScoreRuleCreateInterface, FieldScoreRuleUpdateInterface } from "../interfaces/fieldScoreRuleInterface";


class FieldScoreRuleService {
  private model: ModelStatic<FieldScoreRule> = FieldScoreRule;

  async get(fieldScoreRule?: any) {
    try {
      const fieldScoresRules = await this.model.findAll({ where: fieldScoreRule });
      return resp(200, fieldScoresRules);
    } catch (error) {
      // Lide com erros conforme necessário
      return resp(500, { message: 'Error retrieving fieldScoresRules', error });
    }
  }


  async create(fieldRule: FieldScoreRuleCreateInterface) {
    const { error } = schema.create.validate(fieldRule);
    if (error) return respM(422, error.message);
    try {
      const createdFieldScoreRule = await this.model.create({ ...fieldRule })
      return resp(201, createdFieldScoreRule)
    } catch (error) {
      return resp(500, { message: 'Error creating FieldScoreRule', error });
    }
  }

  async update(id: number, olt: FieldScoreRuleUpdateInterface) {
    const { error } = schema.update.validate(olt);
    if (error) return respM(422, error.message);

    try {
      const existingFieldScoreRule = await this.model.findOne({ where: { id } });
      if (!existingFieldScoreRule) return respM(404, 'OLT not found');
      await existingFieldScoreRule.update({ ...olt });

      return resp(200, existingFieldScoreRule);
    } catch (error) {
      return resp(500, { message: 'Error updating OLT', error });
    }
  }
}
export default FieldScoreRuleService