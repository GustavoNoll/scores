import { CronJob } from 'cron';
import AcsInform from '../database/models/acsInform';
import { Op } from 'sequelize';
import DeviceService from '../services/deviceService';

let startTime: Date | null = null;

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

    // Processamento de cada acs inform encontrado
    for (const acsInform of acsInforms) {
      console.log(`Processando acs inform: ${acsInform.deviceTag}`);
      new DeviceService().processAcsInform(acsInform)

    }

    // Após o processamento, destruir todos os acs informs
    /*await AcsInform.destroy({
      where: {
        createdAt: {
          [Op.lt]: startTime
        }
      }
    });*/

    const timestamp = new Date().toISOString();
    console.log(`Processamento completo em ${timestamp}`);
  } catch (error) {
    console.error('Erro ao processar acs informs:', error);
  }
}

const job = new CronJob('* * * * *', processAcsInforms);

job.start();

// Log de confirmação do agendamento
console.log('Agendamento de processamento de acs informs configurado para rodar a cada 1 minuto.');

// Exporte o job se necessário
export default job;
