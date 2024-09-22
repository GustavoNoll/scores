import { CronJob } from 'cron';
import AcsInform from '../database/models/acsInform';
import { Op } from 'sequelize';
import AcsInformService from '../services/acsInformService';

const BATCH_SIZE = 10;

let startTime: Date | null = null;

async function processAcsInformBatch(batch: AcsInform[]) {
  const acsInformService = new AcsInformService();
  return Promise.all(batch.map(acsInform =>
    acsInformService.processAcsInform(acsInform)
      .catch(error => console.error(`Error processing ACS inform ${acsInform.id}:`, error))
  ));
}

export async function processAcsInforms() {
  try {
    console.log('Executando processamento de acs informs...');

    startTime = new Date(); // Marca o tempo de início do processamento

    const acsInforms = await AcsInform.findAll({
      where: {
        createdAt: {
          [Op.lt]: startTime
        }
      }
    });
    console.log(`Encontrados ${acsInforms.length} acs informs para processamento.`);

    // Process ACS informs in batches
    for (let i = 0; i < acsInforms.length; i += BATCH_SIZE) {
      const batch = acsInforms.slice(i, i + BATCH_SIZE);
      console.log(`Processando batch ${i / BATCH_SIZE + 1} de ${Math.ceil(acsInforms.length / BATCH_SIZE)}`);
      await processAcsInformBatch(batch);
    }

    const timestamp = new Date().toISOString();
    console.log(`Processamento completo em ${timestamp}`);
  } catch (error) {
    console.error('Erro ao processar acs informs:', error);
  }
}


let job: CronJob;
if (process.env.NODE_ENV !== 'test') {
  job = new CronJob('* * * * *', processAcsInforms);
  job.start();
  console.log('Agendamento de processamento de acs informs configurado para rodar a cada 1 minuto.');
}

export { job };
