import { ModelStatic } from "sequelize";
import resp from "../utils/resp";
import schema from "./validations/schema";
import respM from "../utils/respM";
import Olt from "../database/models/olt";
import OltInterface from "../interfaces/oltInterface";

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


  async create(olt: OltInterface) {
    const { error } = schema.olt.validate(olt)
    if (error) return respM(422, error.message);
    const createdOlt = await this.model.create({ ...olt })
    return resp(201, createdOlt)
  }
}
export default OltService