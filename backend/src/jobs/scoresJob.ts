import { CronJob } from "cron";
import Device from "../database/models/device";
import Client from "../database/models/client";
import { Op } from "sequelize";
import FieldScoreService from "../services/fieldScoreService";
import ClientScore from "../database/models/clientScore";
import { MIN_HOURS_TO_RECALCULATE_CLIENT_SCORE } from "../constants/processConstants";
import ExperienceScore from "../database/models/experienceScore"; // Assuming this is the correct import

export async function processScores() {
  try {
    console.log('Executando processamento de scores...');
    // Obtenha todos os clientes que possuem dispositivos associados
    const clients = await Client.findAll({
      include: [
        {
          model: Device,
          as: 'device'
        }
      ]
    });

    console.log(`Encontrados ${clients.length} clientes para processamento.`);

    const now = new Date();
    const minHoursAgo = new Date(now.getTime() - MIN_HOURS_TO_RECALCULATE_CLIENT_SCORE * 60 * 60 * 1000);

    for (const client of clients) {
      try {
        const device = (client as any).device;
        if (!device) continue;

        const recentScore = await ClientScore.findOne({
          where: {
            clientId: client.id,
            createdAt: {
              [Op.gt]: minHoursAgo
            }
          }
        });

        if (!recentScore) {
          const fieldScoreService = new FieldScoreService()
          const experienceScore = await ExperienceScore.getByClient(client)
          if (!experienceScore) {
            console.log(`No ExperienceScore found for client ${client.integrationId}`)
            continue
          }
          await fieldScoreService.processScores(device, client)
        } else {
          console.log(`client ${client.integrationId} had a score in the last 12 hours`)
        }
      } catch (clientError) {
        console.error(`Error processing scores for client ${client.id}:`, clientError);
      }
    }

    console.log('Scores processados com sucesso!');
  } catch (error) {
    console.error('Error processing scores:', error);
  }
}

let job: CronJob;
if (process.env.NODE_ENV !== 'test') {
  job = new CronJob('* * * * *', processScores);
  job.start();
  console.log('Score processing schedule configured to run every 1 minute.');
}

export { job };