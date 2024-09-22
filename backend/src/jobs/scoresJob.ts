import { CronJob } from "cron";
import Device from "../database/models/device";
import Client from "../database/models/client";
import { Op } from "sequelize";
import FieldScoreService from "../services/fieldScoreService";
import ClientScore from "../database/models/clientScore";
import { MIN_HOURS_TO_RECALCULATE_CLIENT_SCORE } from "../constants/processConstants";
import ExperienceScore from "../database/models/experienceScore";

const BATCH_SIZE = 10;

async function processClient(client: Client, minHoursAgo: Date) {
  const device = (client as any).device;
  if (!device) {
    console.warn(`Client ${client.id} has no associated device`);
    return;
  }

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
      console.warn(`No ExperienceScore found for client ${client.integrationId}`);
      return;
    }
    await fieldScoreService.processScores(device, client)
    console.log(`Processed scores for client ${client.integrationId}`);
  } else {
    console.log(`Client ${client.integrationId} had a score in the last 12 hours`);
  }
}

export async function processScores() {
  try {
    console.log('Executando processamento de scores...');
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

    // Process clients in batches
    for (let i = 0; i < clients.length; i += BATCH_SIZE) {
      const batch = clients.slice(i, i + BATCH_SIZE);
      console.log(`Processando batch ${i / BATCH_SIZE + 1} de ${Math.ceil(clients.length / BATCH_SIZE)}`);
      await Promise.all(batch.map(client =>
        processClient(client, minHoursAgo).catch(error =>
          console.error(`Error processing scores for client ${client.id}:`, error)
        )
      ));
    }

    console.log('Scores processados com sucesso!');
  } catch (error) {
    console.error('Error processing scores:', error);
  }
}

let job: CronJob;
if (process.env.NODE_ENV !== 'test') {
  job = new CronJob('*/5 * * * *', processScores);  // Run every 5 minutes
  job.start();
  console.log('Score processing schedule configured to run every 5 minutes.');
}

export { job };