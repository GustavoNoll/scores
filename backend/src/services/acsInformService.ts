import { ModelStatic } from "sequelize";
import AcsInform from "../database/models/acsInform";
import resp from "../utils/resp";
import schema from "./validations/schema";
import respM from "../utils/respM";
import AcsInformInterface from "../interfaces/acsInformInterface";

class AcsInformService {
  private model: ModelStatic<AcsInform> = AcsInform;

  async get(acsInform?: any) {
    try {
      const acsInforms = await this.model.findAll({
        where: acsInform,
      });
      return resp(200, acsInforms);
    } catch (error) {
      // Lide com erros conforme necessário
      return resp(500, { message: 'Error retrieving AcsInforms', error });
    }
  }

  async create(acsInform: AcsInformInterface) {
    const { error } = schema.acsInform.validate(acsInform)
    if (error) return respM(422, error.message);
    const created = await this.model.create({ ...acsInform })
    return resp(201, created)
  }
}
export default AcsInformService