import { ModelStatic, UniqueConstraintError } from "sequelize";
import resp from "../utils/resp";
import schema from "./validations/fieldScoreRuleSchema";
import respM from "../utils/respM";
import FieldScoreRule from "../database/models/olt";
import { FieldScoreRuleCreateInterface, FieldScoreRuleUpdateInterface } from "../interfaces/fieldScoreRuleInterface";


class FieldScoreRuleService {
  private model: ModelStatic<FieldScoreRule> = FieldScoreRule;

  async get() {
    try {
      const fieldScoresRules = await this.model.findAll({ where: {} });
      return resp(200, fieldScoresRules);
    } catch (error) {
      // Lide com erros conforme necessário
      return resp(500, { message: 'Error retrieving fieldScoresRules', error });
    }
  }


  async create(fieldScoreRuleData: FieldScoreRuleCreateInterface) {
    const { error } = schema.create.validate(fieldScoreRuleData);
    if (error) return respM(422, error.message);
    try {
      const createdFieldScoreRule = await this.model.create({ ...fieldScoreRuleData })
      return resp(201, createdFieldScoreRule)
    } catch (error) {
      return resp(500, { message: 'Error creating FieldScoreRule', error });
    }
  }

  async update(fieldScoreRuleData: FieldScoreRuleUpdateInterface) {
    const { error } = schema.update.validate(fieldScoreRuleData);
    if (error) return respM(422, error.message);

    try {
      return resp(200, null);
    } catch (error) {
      return resp(500, { message: 'Error updating FieldScoreRule', error });
    }
  }
}
export default FieldScoreRuleService