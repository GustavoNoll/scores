import { ModelStatic } from "sequelize";
import resp from "../utils/resp";
import schema from "./validations/schema";
import respM from "../utils/respM";
import Cto from "../database/models/cto";
import CtoInterface from "../interfaces/ctoInterface";

class CtoService {
  private model: ModelStatic<Cto> = Cto;

  async getAll(){
    const ctos = await this.model.findAll()
    return resp(200, ctos)
  }

  async createCto(cto: CtoInterface) {
    const { error } = schema.cto.validate(cto)
    if (error) return respM(422, error.message);
    const createdCto = await this.model.create({ ...cto })
    return resp(201, createdCto)
  }
}
export default CtoService