const { parentPort, workerData } = require('worker_threads');
const AcsInformService = require('../../services/acsInformService').default;

async function processInforms() {
  const { informs } = workerData;
  const acsInformService = new AcsInformService();
  
  console.log(`Worker iniciando processamento de ${informs.length} informs`);
  
  let processedCount = 0;
  
  try {
    // Process all informs sequentially within this worker
    for (const inform of informs) {
      await acsInformService.processAcsInform(inform);
      processedCount++;
    }
    
    parentPort?.postMessage(processedCount);
    
  } catch (error) {
    console.error('Worker error:', error);
    throw error;
  }
}

processInforms(); 