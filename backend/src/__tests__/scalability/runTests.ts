import { Sequelize } from 'sequelize';
import { runCompleteScalabilityAnalysis } from './informProcessingTest';
import * as config from "../../database/config/database";



async function main() {
  process.env.NODE_ENV = 'test';
  const sequelize = new Sequelize(config);
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  try {
    process.env.UV_THREADPOOL_SIZE = '16';


    // Initialize Sequelize connection
    await sequelize.authenticate();
    console.log('Database connection established successfully');

    console.log('=== Iniciando Testes de Escalabilidade ===\n');
    
    const results = await runCompleteScalabilityAnalysis();
    
    // Salvar resultados em um arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fs = require('fs');
    fs.writeFileSync(
      `scalability-results-${timestamp}.json`,
      JSON.stringify(results, null, 2)
    );
    
    console.log('\n=== Testes Concluídos ===');
    console.log(`Resultados salvos em: scalability-results-${timestamp}.json`);
    
  } catch (error) {
    console.error('Erro durante os testes:', error);
    await sequelize.close(); // Close database connection on error
    process.exit(1);
  } finally {
    // Ensure database connection is closed
    await sequelize.close();
  }
}

main(); 