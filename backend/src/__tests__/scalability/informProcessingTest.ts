import { generateMockZteInform } from '../mocks/acsInforms/generator';
import AcsInform from '../../database/models/acsInform';
import Client from '../../database/models/client';
import { Worker } from 'worker_threads';
import os from 'os';


// Adicionar nova interface para métricas de recursos
interface ResourceMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  cpuUsage: number;
  rss: number;
  peakHeapUsed: number;  // Novo: pico de uso do heap
  averageHeapUsed: number; // Novo: média de uso do heap
}

// Add new interface for system specs
interface SystemSpecs {
  platform: string;
  cpuModel: string;
  cpuCores: number;
  totalMemory: number;
  nodeVersion: string;
}

// Atualizar interface TestResult
interface TestResult {
  threadCount: number;
  informCount: number;
  totalTimeMs: number;
  informsPerSecond: number;
  successRate: number;
  resourceMetrics: ResourceMetrics;  // Nova propriedade
  systemSpecs: SystemSpecs;  // New property
}

// Função para coletar métricas de recursos
async function collectResourceMetrics(): Promise<ResourceMetrics> {
  // Aguardar um momento para estabilizar a memória
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const memory = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const cpuCores = os.cpus().length;
  
  return {
    heapUsed: Math.round(memory.heapUsed / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(memory.heapTotal / 1024 / 1024 * 100) / 100,
    external: Math.round(memory.external / 1024 / 1024 * 100) / 100,
    rss: Math.round(memory.rss / 1024 / 1024 * 100) / 100,
    cpuUsage: Math.round((cpuUsage.user + cpuUsage.system) / 1000000 * 100 / cpuCores) / 100,
    peakHeapUsed: 0,
    averageHeapUsed: 0
  };
}

// Function to collect system specifications
function getSystemSpecs(): SystemSpecs {
  return {
    platform: `${os.platform()} ${os.release()}`,
    cpuModel: os.cpus()[0].model,
    cpuCores: os.cpus().length,
    totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024 * 100) / 100, // GB with 2 decimals
    nodeVersion: process.version
  };
}

export async function runScalabilityTest(
  threadCounts: number[],  // Ex: [1, 2, 4, 8, 16]
  informCounts: number[]   // Ex: [100, 1000, 10000]
): Promise<TestResult[]> {
  await Client.create({
    serialNumber: 'AAAA12345678',
    integrationId: '12345678',
    latitude: -10.000000,
    longitude: -10.000000,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  const results: TestResult[] = [];

  for (const threadCount of threadCounts) {
    for (const informCount of informCounts) {
      console.log(`Gerando ${informCount} informs...`);
      
      const memoryReadings: number[] = [];
      let peakHeapUsed = 0;
      
      // Monitorar uso de memória durante o processamento
      const memoryMonitor = setInterval(() => {
        const currentMemory = process.memoryUsage();
        const heapUsedMB = currentMemory.heapUsed / 1024 / 1024;
        memoryReadings.push(heapUsedMB);
        peakHeapUsed = Math.max(peakHeapUsed, heapUsedMB);
      }, 100);

      await generateTestInforms(informCount);
      const chunks = await generateInformChunks(threadCount, informCount);
      const startTime = Date.now();
      
      const processedCount = await processInformsWithThreads(threadCount, informCount, chunks);
      
      const endTime = Date.now();
      clearInterval(memoryMonitor);

      // Calcular média de uso de memória
      const averageHeapUsed = memoryReadings.length > 0
        ? Math.round((memoryReadings.reduce((a, b) => a + b, 0) / memoryReadings.length) * 100) / 100
        : 0;

      const totalTimeMs = endTime - startTime;
      const informsPerSecond = (processedCount / totalTimeMs) * 1000;
      const successRate = (processedCount / informCount) * 100;

      const finalMetrics = await collectResourceMetrics();
      const resourceMetrics: ResourceMetrics = {
        ...finalMetrics,
        peakHeapUsed: Math.round(peakHeapUsed * 100) / 100,
        averageHeapUsed
      };

      results.push({
        threadCount,
        informCount,
        totalTimeMs,
        informsPerSecond,
        successRate,
        resourceMetrics,
        systemSpecs: getSystemSpecs()
      });

      // Atualizar a exibição dos resultados
      console.log('\nMemory Usage Statistics:');
      console.table({
        'Peak Heap Used (MB)': resourceMetrics.peakHeapUsed,
        'Average Heap Used (MB)': resourceMetrics.averageHeapUsed,
        'Final Heap Used (MB)': resourceMetrics.heapUsed,
        'RSS Memory (MB)': resourceMetrics.rss
      });

      await cleanupTestData();
      
      // Aguardar um pouco antes do próximo teste
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

async function generateTestInforms(count: number): Promise<void> {
  // Create informs in smaller batches to avoid string length limitations
  const BATCH_SIZE = 100; // Adjust this value if needed
  const totalBatches = Math.ceil(count / BATCH_SIZE);
  
  for (let i = 0; i < totalBatches; i++) {
    const batchSize = Math.min(BATCH_SIZE, count - (i * BATCH_SIZE));
    const informs = Array.from({ length: batchSize }, () => generateMockZteInform());
    
    await AcsInform.bulkCreate(informs.map(inform => ({
      ...inform,
      createdAt: new Date(),
      updatedAt: new Date()
    })));
  }
}

// New function to generate chunks
async function generateInformChunks(threadCount: number, totalInforms: number) {
  // Fetch all informs at once
  const allInforms = await AcsInform.findAll({
    order: [['created_at', 'DESC']],
    limit: totalInforms,
    raw: true
  });

  // Divide informs into chunks for each worker
  const informsPerThread = Math.ceil(allInforms.length / threadCount);
  return Array.from({ length: threadCount }, (_, i) => {
    const start = i * informsPerThread;
    return allInforms.slice(start, start + informsPerThread);
  }).filter(chunk => chunk.length > 0); // Remove empty chunks
}

// Modified processInformsWithThreads function
async function processInformsWithThreads(
  threadCount: number,
  totalInforms: number,
  chunks: AcsInform[][]
): Promise<number> {
  console.log(`Iniciando ${chunks.length} workers em paralelo`);

  const workerPromises = chunks.map((chunk, index) => {
    return new Promise<number>((resolve, reject) => {
      const worker = new Worker('./src/__tests__/scalability/worker.js', {
        workerData: { informs: chunk }
      });

      console.log(`Worker ${index + 1} iniciado com ${chunk.length} informs`);

      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  });

  try {
    const results = await Promise.all(workerPromises);
    return results.reduce((a, b) => a + b, 0);
  } catch (error) {
    console.error('Error processing informs:', error);
    throw error;
  }
}

async function cleanupTestData(): Promise<void> {
  // Delete test data from database instead of clearing memory
  await AcsInform.destroy({
    where: {},
    truncate: true
  });
}

// Script para executar os testes
export async function runCompleteScalabilityAnalysis() {
  try {
    const threadCounts = [1, 2, 4, 8, 16];
    const informCounts = [100, 1000, 10000];
    
    console.log('Starting scalability analysis...');
    
    const results = await runScalabilityTest(threadCounts, informCounts);
    const systemSpecs = getSystemSpecs();
    
    // Log system specifications
    console.log('\nSystem Specifications:');
    console.table({
      'Platform': systemSpecs.platform,
      'CPU Model': systemSpecs.cpuModel,
      'CPU Cores': systemSpecs.cpuCores,
      'Total Memory (GB)': systemSpecs.totalMemory,
      'Node.js Version': systemSpecs.nodeVersion
    });

    const formattedResults = results.map(result => ({
      'Threads': result.threadCount,
      'Informs': result.informCount,
      'Total Time (ms)': result.totalTimeMs,
      'Informs/second': Number(result.informsPerSecond.toFixed(2)),
      'Success Rate (%)': Number(result.successRate.toFixed(2)),
      'Peak Heap (MB)': Number(result.resourceMetrics.peakHeapUsed.toFixed(2)),
      'Avg Heap (MB)': Number(result.resourceMetrics.averageHeapUsed.toFixed(2)),
      'Final Heap (MB)': Number(result.resourceMetrics.heapUsed.toFixed(2)),
      'RSS Memory (MB)': Number(result.resourceMetrics.rss.toFixed(2)),
      'CPU Usage (%)': Number((result.resourceMetrics.cpuUsage * 100).toFixed(2))
    }));

    console.log('\nResults:');
    console.table(formattedResults);
    
    return {
      systemSpecs,
      results: formattedResults
    };
  } catch (error) {
    console.error('Error during scalability analysis:', error);
    throw error;
  }
} 