import { ModelStatic } from "sequelize";
import Client from "../database/models/client";
import resp from "../utils/resp";
import ClientInterface from "../interfaces/clientInterface";
import schema from "./validations/schema";
import respM from "../utils/respM";

class ClientService {
  private model: ModelStatic<Client> = Client;

  async getAll(){
    const clients = await this.model.findAll()
    return resp(200, clients)
  }

  async createClient(client: ClientInterface) {
    const { error } = schema.client.validate(client)
    if (error) return respM(422, error.message);
    const createdClient = await this.model.create({ ...client })
    return resp(201, createdClient)
  }
}
export default ClientService