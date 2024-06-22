import { ModelStatic } from "sequelize";
import resp from "../utils/resp";
import schema from "./validations/schema";
import respM from "../utils/respM";
import Cto from "../database/models/cto";
import CtoInterface from "../interfaces/ctoInterface";

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

  async create(cto: CtoInterface) {
    const { error } = schema.cto.validate(cto)
    if (error) return respM(422, error.message);
    const createdCto = await this.model.create({ ...cto })
    return resp(201, createdCto)
  }
}
export default CtoService