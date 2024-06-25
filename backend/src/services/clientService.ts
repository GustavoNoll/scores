import { ModelStatic, Sequelize } from "sequelize";
import Client from "../database/models/client";
import resp from "../utils/resp";
import ClientInterface from "../interfaces/clientInterface";
import schema from "./validations/clientSchema";
import respM from "../utils/respM";
import Olt from "../database/models/olt";
import Cto from "../database/models/cto";
import { UniqueConstraintError } from 'sequelize';

class ClientService {
  private model: ModelStatic<Client> = Client;

  async get(client?: any) {
    try {
      const clients = await this.model.findAll({ where: client, raw: true});
      return resp(200, clients);
    } catch (error) {
      return resp(500, { message: 'Error retrieving Clients', error });
    }
  }

  async create(client: ClientInterface) {
    const { error } = schema.clientCreate.validate(client)
    if (error) return respM(422, error.message);
    try {
      const cto = await Cto.findOne({ where: { integrationId: client.ctoIntegrationId } });
      if (!cto) return respM(404, 'CTO not found');

      // Busca o oltId correspondente ao oltIntegrationId
      const olt = await Olt.findOne({ where: { integrationId: client.oltIntegrationId } });
      if (!olt) return respM(404, 'OLT not found');

      // Cria o cliente com os IDs buscados
      const createdClient = await this.model.create({ 
        ...client, 
        ctoId: cto.id, 
        oltId: olt.id 
      });
      return resp(201, createdClient)
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return respM(409, 'A client with the provided integration ID already exists.');
      }
      return resp(500, { message: 'Error creating Client', error });
    }
  }

  async update(integrationId: string, client: Partial<ClientInterface>) {
    console.log(client)
    const { error } = schema.clientUpdate.validate(client);
    if (error) return respM(422, error.message);

    try {
        const existingClient = await this.model.findOne({ where: { integrationId } });
        if (!existingClient) return respM(404, 'Client not found');

        let ctoId, oltId;

        if (client.ctoIntegrationId) {
            const cto = await Cto.findOne({ where: { integrationId: client.ctoIntegrationId } });
            if (!cto) return respM(404, 'CTO not found');
            ctoId = cto.id;
        }

        if (client.oltIntegrationId) {
            const olt = await Olt.findOne({ where: { integrationId: client.oltIntegrationId } });
            if (!olt) return respM(404, 'OLT not found');
            oltId = olt.id;
        }

        // Ensure the integrationId is not updated
        if (client.integrationId && client.integrationId !== integrationId) {
            return respM(400, 'Cannot update integrationId');
        }

        // Update the client with optional ctoId and oltId if they are provided
        await existingClient.update({
            ...client,
            ...(ctoId && { ctoId }),
            ...(oltId && { oltId })
        });

        return resp(200, existingClient);
    } catch (error) {
        if (error instanceof UniqueConstraintError) {
            return respM(409, 'A client with the provided integration ID already exists.');
        }
        return resp(500, { message: 'Error updating Client', error });
    }
  }
}
export default ClientService