import { deepFind, stringPercentToFloat, stringToFloat } from '../convertUtils';
import DataModel from '../dataModel';
import { ConnectedDevices, WifiNetworks, CpuUsage, Temperature, MemoryUsage, RxPower, TxPower, Voltage } from '../dataModelTypes';
import { getConnectedDevices, getWifiNetworks } from '../trVersions/tr069';

class ZteF670Lv9Model extends DataModel {
  constructor() {
    super({
      manufacturer: 'ZTE',
      oui: '*',
      productClass: 'F670L',
      modelName: 'F670L',
      hardwareVersion: 'V9.0',
      softwareVersion: '*'  
    });
  }

  getConnectedDevices(jsonData: any): ConnectedDevices{
    const wifiNetworks = this.getWifiNetworks(jsonData);
    return getConnectedDevices(jsonData, wifiNetworks);
  }
  
  getCpuUsage(jsonData: any): CpuUsage {
    const cpuUsageStr = deepFind(jsonData, ['InternetGatewayDevice', 'DeviceInfo', 'X_ZTE-COM_CpuUsed', '_value']);

    if (cpuUsageStr) {
      const cpuUsageArr = cpuUsageStr.split(';');
      const cpuUsageFirstPart = cpuUsageArr[0];

      return stringPercentToFloat(cpuUsageFirstPart)
    }

    return null;
  }

  getTemperature(jsonData: any): Temperature {
    const temperature = deepFind(jsonData, [ 'InternetGatewayDevice', 'WANDevice', '1', 'X_ZTE-COM_WANPONInterfaceConfig', 'TransceiverTemperature', '_value'])
    return stringToFloat(temperature)
  }
  
  getMemoryUsage(jsonData: any): MemoryUsage {
    const memoryUsageStr = deepFind(jsonData, ['InternetGatewayDevice', 'DeviceInfo', 'X_ZTE-COM_MemUsed', '_value']);
  
    return stringPercentToFloat(memoryUsageStr)
  }

  getRxPower(jsonData: any): RxPower {
    const rxPowerStr = deepFind(jsonData, [ 'InternetGatewayDevice', 'WANDevice', '1', 'X_ZTE-COM_WANPONInterfaceConfig', 'RXPower', '_value'])

    return stringToFloat(rxPowerStr); 
  }

  getTxPower(jsonData: any): TxPower {
    const txPowerStr =  deepFind(jsonData, ['InternetGatewayDevice', 'WANDevice', '1', 'X_ZTE-COM_WANPONInterfaceConfig', 'TXPower', '_value'])
    return stringToFloat(txPowerStr);
  }

  getWifiNetworks(jsonData: any): WifiNetworks{
    return getWifiNetworks(jsonData, 'X_ZTE-COM_Rssi')
  }

  getVoltage(jsonData: any): Voltage {
    const voltageStr = deepFind(jsonData, [ 'InternetGatewayDevice', 'WANDevice', '1', 'X_ZTE-COM_WANPONInterfaceConfig', 'SupplyVoltage', '_value'])
    return stringToFloat(voltageStr);
  }
}

export default ZteF670Lv9Model