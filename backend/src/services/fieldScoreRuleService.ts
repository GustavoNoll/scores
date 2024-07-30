import { ModelStatic, UniqueConstraintError } from "sequelize";
import resp from "../utils/resp";
import schema from "./validations/fieldScoreRuleSchema";
import respM from "../utils/respM";
import FieldScoreRule from "../database/models/fieldScoreRule";
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
      // Verificar se já existe um registro com a mesma combinação de field, oltId, e ctoId
      const existingRecord = await this.model.findOne({
        where: {
          field: fieldScoreRuleData.field,
          oltId: fieldScoreRuleData.oltId,
          ctoId: fieldScoreRuleData.ctoId
        }
      });

      if (existingRecord) {
        // Se o registro existir, atualize-o com os novos dados
        await this.model.update(fieldScoreRuleData, {
          where: {
            id: existingRecord.id
          }
        });
        const updatedRecord = await this.model.findByPk(existingRecord.id);
        return resp(200, updatedRecord);
      } else {
        // Se o registro não existir, crie um novo
        const createdFieldScoreRule = await this.model.create({ ...fieldScoreRuleData });
        return resp(201, createdFieldScoreRule);
      }
    } catch (error) {
      return resp(500, { message: 'Error creating or updating FieldScoreRule', error });
    }
  }
}
export default FieldScoreRuleService