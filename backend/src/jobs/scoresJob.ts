import { CronJob } from "cron";
import Device from "../database/models/device";
import Client from "../database/models/client";
import { Op } from "sequelize";
import FieldScoreService from "../services/fieldScoreService";
import ClientScore from "../database/models/clientScore";

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
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    for (const client of clients) {
      const device = (client as any).device;

      if (!device) continue;

      // Verifica se o dispositivo tem um score geral nas últimas 12 horas
      const recentScore = await ClientScore.findOne({
        where: {
          deviceId: device.id,
          field: 'general',
          createdAt: {
            [Op.gt]: twelveHoursAgo
          }
        }
      });

      if (!recentScore) {
        const fieldScoreService = new FieldScoreService()
        await fieldScoreService.generateScores(device, client)
      }else{
        console.log(`client ${client.integrationId} had a score in the last 12 hours`)
      }
    }

    console.log('Scores processados com sucesso!');
  } catch (error) {
    console.error('Erro ao processar scores:', error);
  }
}

const job = new CronJob('* * * * *', processScores);

job.start();

// Log de confirmação do agendamento
console.log('Agendamento de processamento de score configurado para rodar a cada 1 minuto.');

// Exporte o job se necessário
export default job;