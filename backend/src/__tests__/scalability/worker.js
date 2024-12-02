const { parentPort, workerData } = require('worker_threads');
const AcsInformService = require('../../services/acsInformService').default;

async function processInforms() {
  const { informs } = workerData;
  const acsInformService = new AcsInformService();
  
  console.log(`Worker iniciando processamento de ${informs.length} informs`);
  
  const startTime = Date.now();
  let processedCount = 0;
  
  try {
    // Process all informs sequentially within this worker
    for (const inform of informs) {
      await acsInformService.processAcsInform(inform);
      processedCount++;
      
      // Log apenas a cada 10% do progresso
      if (processedCount % Math.max(Math.floor(informs.length / 10), 1) === 0) {
        const percentComplete = Math.floor((processedCount / informs.length) * 100);
        console.log(`Worker: ${percentComplete}% completo (${processedCount}/${informs.length})`);
      }
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    console.log(`Worker finalizou em ${totalTime}ms`);
    
    parentPort?.postMessage(processedCount);
    
  } catch (error) {
    console.error('Worker error:', error);
    throw error;
  }
}

processInforms(); 