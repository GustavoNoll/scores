import { generateMockZteInform } from '../mocks/acsInforms/generator';
import AcsInform from '../../database/models/acsInform';
import Client from '../../database/models/client';
import { Worker } from 'worker_threads';
import os from 'os';
import fs from 'fs';

// Adicionar nova interface para métricas de recursos
interface ResourceMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  averageCpuUsage: number;
  rss: number;
  averageHeapUsed: number;
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
  totalTimeSeconds: number;
  informsPerSecond: number;
  resourceMetrics: ResourceMetrics;  // Nova propriedade
  systemSpecs: SystemSpecs;  // New property
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

async function getCpuUsage(): Promise<number> {
  const startTime = process.hrtime();
  const startUsage = process.cpuUsage();
  
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const elapsedTime = process.hrtime(startTime);
  const elapsedUsage = process.cpuUsage(startUsage);
  
  const elapsedTimeMs = (elapsedTime[0] * 1e9 + elapsedTime[1]) / 1e6;
  const cpuPercent = ((elapsedUsage.user + elapsedUsage.system) / 1000) / elapsedTimeMs * 100;
  
  // Retornar o valor médio por core
  return cpuPercent;
}

export async function runScalabilityTest(
  threadCounts: number[],
  informCounts: number[]
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
      const rssReadings: number[] = [];
      const cpuReadings: number[] = [];
      

      await generateTestInforms(informCount);
      const chunks = await generateInformChunks(threadCount, informCount);
      const startTime = Date.now();
      

      const resourceMonitor = setInterval(async () => {
        const memory = process.memoryUsage();
        const cpuUsage = await getCpuUsage();

        memoryReadings.push(memory.heapUsed / 1024 / 1024);
        rssReadings.push(memory.rss / 1024 / 1024);
        cpuReadings.push(cpuUsage);

        const currentAverageHeap = memoryReadings.reduce((a, b) => a + b, 0) / memoryReadings.length;
        const currentAverageRss = rssReadings.reduce((a, b) => a + b, 0) / rssReadings.length;
        const currentAverageCpu = cpuReadings.reduce((a, b) => a + b, 0) / cpuReadings.length;

        console.log('\nCurrent Resource Usage (Averages):');
        console.log(`Average Heap Used: ${currentAverageHeap.toFixed(2)} MB`);
        console.log(`Average RSS: ${currentAverageRss.toFixed(2)} MB`);
        console.log(`Average CPU Usage: ${currentAverageCpu.toFixed(2)}%`);
      }, 100);

      const processedCount = await processInformsWithThreads(threadCount, informCount, chunks);
      
      const endTime = Date.now();
      clearInterval(resourceMonitor);

      const averageHeapUsed = memoryReadings.length > 0
        ? Math.round((memoryReadings.slice(0, 15).reduce((a, b) => a + b, 0) / Math.min(memoryReadings.length, 15)) * 100) / 100
        : 0;

      const averageRss = rssReadings.length > 0
        ? Math.round((rssReadings.slice(0, 15).reduce((a, b) => a + b, 0) / Math.min(rssReadings.length, 15)) * 100) / 100
        : 0;

      const averageCpuUsage = cpuReadings.length > 0
        ? Math.round((cpuReadings.slice(0, 15).reduce((a, b) => a + b, 0) / Math.min(cpuReadings.length, 15)) * 100) / 100
        : 0;


      const totalTimeSeconds = (endTime - startTime) / 1000;
      const informsPerSecond = processedCount / totalTimeSeconds;

      const resourceMetrics: ResourceMetrics = {
        heapUsed: averageHeapUsed,
        heapTotal: 0,
        external: 0,
        averageCpuUsage,
        rss: averageRss,
        averageHeapUsed
      };

      results.push({
        threadCount,
        informCount,
        totalTimeSeconds,
        informsPerSecond,
        resourceMetrics,
        systemSpecs: getSystemSpecs()
      });

      // Update console output to show only averages
      console.log('\nResource Usage Statistics (Averages):');
      console.table({
        'Average Heap Used (MB)': resourceMetrics.averageHeapUsed,
        'Average RSS Memory (MB)': resourceMetrics.rss,
        'Average CPU Usage (%)': resourceMetrics.averageCpuUsage
      });

      await cleanupTestData();
      
      // Aguardar um pouco antes do próximo teste
      // await new Promise(resolve => setTimeout(resolve, 5000));
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
    const threadCounts = [4];
    const informCounts = [30000];
    
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
      'Total Time (s)': result.totalTimeSeconds,
      'Avg Heap (MB)': Number(result.resourceMetrics.averageHeapUsed.toFixed(2)),
      'Avg RSS (MB)': Number(result.resourceMetrics.rss.toFixed(2)),
      'Avg CPU Usage (%)': Number(result.resourceMetrics.averageCpuUsage.toFixed(2))
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