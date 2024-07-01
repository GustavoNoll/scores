import DataModel from '../dataModel';
import { Uptime, Temperature, RxPower, TxPower, Voltage, MemoryUsage, CpuUsage, WifiConnectedDevices, WifiNetworks } from '../dataModelTypes';

class HuaweiWS7001_40Model extends DataModel {
  constructor() {
    super({
      manufacturer: 'Huawei Technologies Co., Ltd',
      oui: '*',
      productClass: 'Huawei',
      modelName: 'WS7001-40',
      hardwareVersion: '*',
      softwareVersion: '*'  
    });
  }

  getUptime(jsonData: object): Uptime {
    return 1;
  }

  getTemperature(jsonData: object): Temperature {
    return null;
  }

  getRxPower(jsonData: object): RxPower {
    return null;
  }

  getTxPower(jsonData: object): TxPower {
    return null;
  }

  getVoltage(jsonData: object): Voltage {
    return null;
  }

  getMemoryUsage(jsonData: object): MemoryUsage {
    return null;
  }

  getCpuUsage(jsonData: object): CpuUsage {
    return null;
  }

  getWifiConnectedDevices(jsonData: object): WifiConnectedDevices{
    return []; 
  }

  getWifiNetworks(jsonData: object): WifiNetworks{
    return [];
  }
}

export default HuaweiWS7001_40Model