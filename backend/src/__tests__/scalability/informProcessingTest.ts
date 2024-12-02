import { Worker } from 'worker_threads';
import { generateMockZteInform } from '../mocks/acsInforms/generator';
import AcsInform from '../../database/models/acsInform';
import AcsInformService from '../../services/acsInformService';
import Client from '../../database/models/client';

// Adicionar nova interface para métricas de recursos
interface ResourceMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  cpuUsage: number;
  rss: number;
}

// Atualizar interface TestResult
interface TestResult {
  threadCount: number;
  informCount: number;
  totalTimeMs: number;
  informsPerSecond: number;
  successRate: number;
  resourceMetrics: ResourceMetrics;  // Nova propriedade
}

// Função para coletar métricas de recursos
async function collectResourceMetrics(): Promise<ResourceMetrics> {
  const memory = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  // Converter CPU usage para porcentagem
  const cpuPercent = (cpuUsage.user + cpuUsage.system) / 1000000; // Converter para segundos
  
  return {
    heapUsed: memory.heapUsed / 1024 / 1024,    // MB
    heapTotal: memory.heapTotal / 1024 / 1024,  // MB
    external: memory.external / 1024 / 1024,     // MB
    rss: memory.rss / 1024 / 1024,              // MB (Resident Set Size)
    cpuUsage: cpuPercent
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
  const acsInformService = new AcsInformService();

  for (const threadCount of threadCounts) {
    console.log(`Testando com ${threadCount} threads...`);
    for (const informCount of informCounts) {
      console.log(`Gerando ${informCount} informs...`);
      // Gerar informs de teste
      await generateTestInforms(informCount);
      
      const startTime = Date.now();
      const initialMetrics = await collectResourceMetrics();
      
      const processedCount = await processInformsWithThreads(threadCount, informCount, acsInformService);
      
      const endTime = Date.now();
      const finalMetrics = await collectResourceMetrics();
      
      const totalTimeMs = endTime - startTime;
      const informsPerSecond = (processedCount / totalTimeMs) * 1000;
      const successRate = (processedCount / informCount) * 100;

      // Calcular diferença nas métricas
      const resourceMetrics: ResourceMetrics = {
        heapUsed: finalMetrics.heapUsed - initialMetrics.heapUsed,
        heapTotal: finalMetrics.heapTotal - initialMetrics.heapTotal,
        external: finalMetrics.external - initialMetrics.external,
        cpuUsage: finalMetrics.cpuUsage - initialMetrics.cpuUsage,
        rss: finalMetrics.rss - initialMetrics.rss
      };

      results.push({
        threadCount,
        informCount,
        totalTimeMs,
        informsPerSecond,
        successRate,
        resourceMetrics
      });

      // Limpar dados de teste
      await cleanupTestData();
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

async function processInformsWithThreads(
  threadCount: number,
  totalInforms: number,
  acsInformService: AcsInformService
): Promise<number> {
  const informsPerThread = Math.ceil(totalInforms / threadCount);
  
  const allInforms = await AcsInform.findAll({
    order: [['created_at', 'DESC']],
    limit: totalInforms
  });
  
  // Create processing chunks based on thread count
  const chunks = Array.from({ length: threadCount }, (_, i) => {
    const startIndex = i * informsPerThread;
    return allInforms.slice(startIndex, startIndex + informsPerThread);
  });

  // Process chunks in parallel using Promise.all
  const results = await Promise.all(
    chunks.map(async (chunk) => {
      let processedCount = 0;
      
      for (const inform of chunk) {
        try {
          await acsInformService.processAcsInform(inform);
          processedCount++;
        } catch (error) {
          console.error('Error processing inform:', error);
        }
      }
      
      return processedCount;
    })
  );

  return results.reduce((a, b) => a + b, 0);
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
  const threadCounts = [1, 2, 4, 8, 16];
  const informCounts = [100, 1000, 10000];
  
  console.log('Iniciando análise de escalabilidade...');
  console.log('Gerando dados de teste...');
  
  const results = await runScalabilityTest(threadCounts, informCounts);
  
  // Add memory usage information
  const formattedResults = results.map(result => ({
    'Threads': result.threadCount,
    'Informs': result.informCount,
    'Tempo Total (ms)': result.totalTimeMs,
    'Informs/segundo': result.informsPerSecond.toFixed(2),
    'Taxa de Sucesso (%)': result.successRate.toFixed(2),
    'Heap Usado (MB)': result.resourceMetrics.heapUsed.toFixed(2),
    'Heap Total (MB)': result.resourceMetrics.heapTotal.toFixed(2),
    'Memória Externa (MB)': result.resourceMetrics.external.toFixed(2),
    'RSS (MB)': result.resourceMetrics.rss.toFixed(2),
    'CPU (%)': (result.resourceMetrics.cpuUsage * 100).toFixed(2)
  }));

  console.log('\nResultados:');
  console.table(formattedResults);
  
  return formattedResults;
} 