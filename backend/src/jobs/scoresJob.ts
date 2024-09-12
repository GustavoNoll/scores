import { CronJob } from "cron";
import Device from "../database/models/device";
import Client from "../database/models/client";
import FieldScore from "../database/models/fieldScore";
import { Op } from "sequelize";
import FieldMeasureService from "../services/fieldMeasureService";
import ExperienceScore from "../database/models/experienceScore";
import FieldMeasure from "../database/models/fieldMeasure";

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
      //console.log(client.integrationId)
      const device = (client as any).device;
      //console.log(device.deviceTag)

      if (!device) continue;

      // Verifica se o dispositivo tem um score geral nas últimas 12 horas
      const recentScore = await FieldScore.findOne({
        where: {
          deviceId: device.id,
          field: 'general',
          createdAt: {
            [Op.gt]: twelveHoursAgo
          }
        }
      });

      if (!recentScore) {
        // Se não tiver um score recente, calcular e salvar
        const score = await calculateScore(device, client);
        if (score){
          console.log(`generated score for client ${client.integrationId}`)
        }else{
          console.log('error generating score')
        }
      }else{
        console.log(`client ${client.integrationId} had a score in the last 12 hours`)
      }
    }

    console.log('Scores processados com sucesso!');
  } catch (error) {
    console.error('Erro ao processar scores:', error);
  }
}

// Função que calcula o score (implementação depende da lógica do negócio)
async function calculateScore(device: Device, client: Client): Promise<number> {
  const fieldMeasureService = new FieldMeasureService()
  const fieldMeasures = await fieldMeasureService.getFieldMeasuresLast7Days(device)
  const experienceScore = await ExperienceScore.getByClient(client)

  const scores: Record<string, number | null> = {};

  // Step 3: Iterate over each field (e.g., cpuUsage, memoryUsage, etc.)
  for (const [field, measures] of Object.entries(fieldMeasures)) {
    const validMeasuresByDay = FieldMeasure.groupMeasuresByDay(measures);

    // Step 4: Check if there are measures for at least 4 different days
    if (hasEnoughDays(validMeasuresByDay)) {
      // Step 5: Calculate the average score for this field
      scores[field] = calculateAverageScore(validMeasuresByDay);
    } else {
      // Not enough data, assign null
      scores[field] = null;
    }
  }

  return 1;
}
function hasEnoughDays(measuresByDay: Map<string, number[]>): boolean {
  const MIN_REQUIRED_DAYS = 4;
  return measuresByDay.size >= MIN_REQUIRED_DAYS;
}

function calculateAverageScore(measuresByDay: Map<string, number[]>): number {
  let totalScore = 0;
  let count = 0;

  measuresByDay.forEach(values => {
    values.forEach(value => {
      totalScore += value;
      count += 1;
    });
  });

  return totalScore / count;
}

const job = new CronJob('* * * * *', processScores);

job.start();

// Log de confirmação do agendamento
console.log('Agendamento de processamento de score configurado para rodar a cada 1 minuto.');

// Exporte o job se necessário
export default job;