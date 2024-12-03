import * as fs from 'fs';
import * as path from 'path';

interface DataModelConfig {
  manufacturer: string;
  oui: string;
  productClass: string;
  modelName: string;
  hardwareVersion: string;
  softwareVersion: string;
}

function parseArgs(): DataModelConfig {
  const args = process.argv.slice(2);
  let config: Partial<DataModelConfig> = {};

  args.forEach(arg => {
    const [key, value] = arg.replace('--', '').split('=');
    switch (key) {
      case 'manufacturer':
        config.manufacturer = value;
        break;
      case 'productClass':
        config.productClass = value;
        break;
      case 'model':
        config.modelName = value;
        break;
      case 'oui':
        config.oui = value;
        break;
      case 'hardwareVersion':
        config.hardwareVersion = value;
        break;
      case 'softwareVersion':
        config.softwareVersion = value;
        break;
      // Adicione outros argumentos conforme necessário
    }
  });

  // Valores padrão para campos opcionais
  return {
    manufacturer: config.manufacturer || '*',
    oui: config.oui || '*',
    productClass: config.productClass || '*',
    modelName: config.modelName || '*',
    hardwareVersion: config.hardwareVersion || '*',
    softwareVersion: config.softwareVersion || '*'
  };
}

function generateTestFile(config: DataModelConfig, className: string, fileName: string) {
  const testTemplate = `import ${className}Model from '../../../utils/dataModels/${fileName.replace('.ts', '')}';
import fs from 'fs';
import path from 'path';

describe('${className}Model', () => {
  let model: ${className}Model;

  beforeEach(() => {
    model = new ${className}Model();
  });

  it('should create instance with correct parameters', () => {
    expect(model.manufacturer).toBe('${config.manufacturer}');
    expect(model.oui).toBe('${config.oui}');
    expect(model.productClass).toBe('${config.productClass}');
    expect(model.modelName).toBe('${config.modelName}');
    expect(model.hardwareVersion).toBe('${config.hardwareVersion}');
    expect(model.softwareVersion).toBe('${config.softwareVersion}');
  });

  describe('translateFields', () => {
    it('should translate fields from ${className} model', () => {
      const jsonContent = fs.readFileSync(path.join(__dirname, './informTests/${fileName.replace('.ts', '.json')}'), 'utf-8');
      const result = model.translateFields(JSON.parse(jsonContent));
      // change to correct values
      expect(result).toEqual({
        cpuUsage: null,
        memoryUsage: null,
        rxPower: null,
        temperature: null,
        txPower: null,
        uptime: null,
        voltage: null,
        connectedDevices: [],
        wifiNetworks: [],
      });
    });
  });
});
`;

  const testFilePath = path.join(__dirname, '../src/__tests__/utils/translateFields', `${fileName.replace('.ts', '.test.ts')}`);
  fs.writeFileSync(testFilePath, testTemplate);
  console.log(`Test file generated successfully at: ${testFilePath}`);
}

function generateDataModel(config: DataModelConfig) {
  const nameParts = [
    config.manufacturer,
    config.oui !== '*' ? config.oui : null,
    config.productClass !== '*' ? config.productClass : null,
    config.modelName !== '*' ? config.modelName : null,
    config.hardwareVersion !== '*' ? config.hardwareVersion : null,
    config.softwareVersion !== '*' ? config.softwareVersion : null,
  ].filter(Boolean);
  const nameFile = nameParts.join('_').toLowerCase().replace(/[^a-z0-9_]/g, '');
  const className = nameParts
    .filter(Boolean)
    .map(part => 
      part
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, ' ')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
    )
    .join('');

  const template = `import { deepFind, stringPercentToFloat, stringToFloat } from '../convertUtils';
import DataModel from '../dataModel';
import { 
  ConnectedDevices, 
  WifiNetworks, 
  CpuUsage, 
  Temperature, 
  MemoryUsage, 
  RxPower, 
  TxPower, 
  Voltage 
} from '../dataModelTypes';
// tr069 functions
import { getConnectedDevices, getWifiNetworks } from '../trVersions/tr069';

class ${className}Model extends DataModel {
  constructor() {
    super({
      manufacturer: '${config.manufacturer}',
      oui: '${config.oui}',
      productClass: '${config.productClass}',
      modelName: '${config.modelName}',
      hardwareVersion: '${config.hardwareVersion}',
      softwareVersion: '${config.softwareVersion}'  
    });
  }

  /*
  // Métodos básicos herdados do DataModel
  getConnectedDevices(jsonData: any): ConnectedDevices {
    // if different from tr069, implement the new version on /trVersions
    // it must return ConnectedDevices
    const wifiNetworks = this.getWifiNetworks(jsonData);
    return getConnectedDevices(jsonData, wifiNetworks);
  }

  getWifiNetworks(jsonData: any): WifiNetworks {
    // if different from tr069, implement the new version on /trVersions
    // it must return WifiNetworks
    return getWifiNetworks(jsonData, "chaveRSSI");
  }

  // Métodos opcionais - Descomente e implemente conforme necessário
  getCpuUsage(jsonData: any): CpuUsage {
    const cpuUsageStr = deepFind(jsonData, ['path', 'to', 'cpu', 'usage']);
    return stringPercentToFloat(cpuUsageStr);
  }

  getTemperature(jsonData: any): Temperature {
    const temperatureStr = deepFind(jsonData, ['path', 'to', 'temperature']);
    return stringToFloat(temperatureStr);
  }

  getMemoryUsage(jsonData: any): MemoryUsage {
    const memoryUsageStr = deepFind(jsonData, ['path', 'to', 'memory', 'usage']);
    return stringPercentToFloat(memoryUsageStr);
  }

  getRxPower(jsonData: any): RxPower {
    const rxPowerStr = deepFind(jsonData, ['path', 'to', 'rx', 'power']);
    return stringToFloat(rxPowerStr);
  }

  getTxPower(jsonData: any): TxPower {
    const txPowerStr = deepFind(jsonData, ['path', 'to', 'tx', 'power']);
    return stringToFloat(txPowerStr);
  }

  getVoltage(jsonData: any): Voltage {
    const voltageStr = deepFind(jsonData, ['path', 'to', 'voltage']);
    return stringToFloat(voltageStr);
  }
  */
}

export default ${className}Model;
`;

  const fileName = `${nameFile}.ts`;
  const filePath = path.join(__dirname, '../src/utils/dataModels', fileName);

  fs.writeFileSync(filePath, template);
  console.log(`DataModel generated successfully at: ${filePath}`);

  // Add test file generation
  generateTestFile(config, className, fileName);
}

// Update main function to include test file information
function main() {
  try {
    const config = parseArgs();
    
    if (!config.manufacturer) {
      console.error('Error: --manufacturer parameter is required');
      console.log('Usage: npm run generate-model -- --manufacturer="Brand" --model="ModelXYZ"');
      process.exit(1);
    }

    generateDataModel(config);
    console.log('Success! Now follow these steps:');
    console.log('1. Open the generated files:');
    console.log('   - Model: src/utils/dataModels/');
    console.log('   - Test: test/utils/dataModels/');
    console.log('2. Update the device identification parameters in the constructor');
    console.log('3. Implement the necessary metric methods');
    console.log('4. Complete the test cases with specific assertions');
  } catch (error) {
    console.error('Error generating files:', error);
    process.exit(1);
  }
}

main();

// npm run generate-model -- --manufacturer="Brand" --model="ModelXYZ" --oui="00259E" --productClass="ModelXYZ" --hardwareVersion="v1.0" --softwareVersion="1.0"