import { ModelStatic, Sequelize } from "sequelize";
import Client from "../database/models/client";
import resp from "../utils/resp";
import { ClientInterface, ProtocolInterface, MassiveInterface } from "../interfaces/clientInterface";
import schema from "./validations/clientSchema";
import respM from "../utils/respM";
import Olt from "../database/models/olt";
import Cto from "../database/models/cto";
import { UniqueConstraintError } from 'sequelize';
import { WeeklyParams, WeeklyScoreResult } from "../interfaces/searchInteface";
import { startOfWeek, endOfWeek, subMonths, eachWeekOfInterval, format } from 'date-fns';
import { Op } from 'sequelize';
import FieldScore from "../database/models/fieldScore";
import FieldMeasure from "../database/models/fieldMeasure";
import Device from "../database/models/device";

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
    const { error } = schema.create.validate(client)
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
    const { error } = schema.update.validate(client);
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

  async weekScores(integrationId: string, params: Partial<WeeklyParams>){
    try {
      console.log(params.months)
      const months = params.months || 1;
      const endDate = new Date();
      const startDate = subMonths(endDate, months);
      const weekIntervals = eachWeekOfInterval({ start: startOfWeek(startDate), end: endOfWeek(endDate) });

      const weekRanges = weekIntervals.map(weekStart => ({
        start: format(weekStart, 'yyyy-MM-dd'),
        end: format(endOfWeek(weekStart), 'yyyy-MM-dd'),
      }));
      const client = await Client.findOne({ where: { integrationId: integrationId}})
      if (!client) return resp(500, { message: 'Client not found' });

      const scores = await Promise.all(weekRanges.map(async (week) => {
        const weeklyScores = await FieldScore.findAll({
          where: {
            clientId: client.id,
            field: 'general',
            createdAt: {
              [Op.between]: [week.start, week.end]
            }
          },
          attributes: [[Sequelize.fn('AVG', Sequelize.col('value')), 'averageScore']],
          raw: true
        }) as unknown as WeeklyScoreResult[];

        console.log(weeklyScores)
        return {
          weekStart: week.start,
          weekEnd: week.end,
          averageScore: weeklyScores[0].averageScore
        };
      }));
      return resp(200, scores);
    } catch (error) {
      return resp(500, { message: 'Error retrieving weekly scores', error });
    }

  }

  async mapLatestScores() {
    try {
      const results = await this.model.findAll({
        attributes: [
          'id',
          'latitude',
          'longitude',
          [
            Sequelize.literal(`
              (
                SELECT "value"
                FROM "field_scores"
                WHERE "field_scores"."client_id" = "Client"."id"
                ORDER BY "field_scores"."created_at" DESC
                LIMIT 1
              )
            `), 
            'score'
          ]
        ],
        raw: true,
      });

      return resp(200, results);
    } catch (error) {
      return resp(500, { message: 'Error retrieving latest scores', error });
    }
  }

  async createProtocol(integrationId: string, protocol: ProtocolInterface) {
    const client = await Client.findOne({ 
      where: { integrationId },
      include: [{
        model: Device,
        as: 'device'
      }]
    });
    
    if (!client) return respM(404, 'Client not found');
    const device = (client as any).device;
    if (!device) return respM(404, 'Client has no associated device');

    const createdProtocol = await FieldMeasure.create({
      clientId: client.id,
      deviceId: device.id,
      field: 'protocolCount',
      value: 1,
      createdAt: protocol.createdAt,
    });
    return resp(201, createdProtocol);
  }

  async createMassiveEvents(integrationId: string, event: MassiveInterface) {
    const client = await Client.findOne({ 
      where: { integrationId },
      include: [{
        model: Device,
        as: 'device'
      }]
    });
    
    if (!client) return respM(404, 'Client not found');
    const device = (client as any).device;
    if (!device) return respM(404, 'Client has no associated device');

    const createdEvent = await FieldMeasure.create({
      clientId: client.id,
      deviceId: device.id,
      field: 'massiveEventCount',
      value: 1,
      createdAt: event.createdAt,
    });
    return resp(201, createdEvent);
  }
}
export default ClientService