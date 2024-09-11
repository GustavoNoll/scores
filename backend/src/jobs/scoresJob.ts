import { CronJob } from "cron";
import Device from "../database/models/device";
import Client from "../database/models/client";
import FieldScore from "../database/models/fieldScore";
import { Op } from "sequelize";

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
        const score = await calculateScore(device); // Implementar essa função
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
async function calculateScore(device: Device): Promise<number> {
  // Aqui você pode aplicar a lógica de cálculo de score para o dispositivo
  // Exemplo: somar alguns campos, analisar histórico, etc.
  const score = Math.random() * 100; // Exemplo de score aleatório
  return score;
}

const job = new CronJob('* * * * *', processScores);

job.start();

// Log de confirmação do agendamento
console.log('Agendamento de processamento de score configurado para rodar a cada 1 minuto.');

// Exporte o job se necessário
export default job;