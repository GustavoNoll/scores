import { deepFind, findWifiNetworkByMac, rssiStringTonNumber, standardizeMac, stringPercentToFloat, stringToFloat } from '../convertUtils';
import DataModel from '../dataModel';
import { Uptime, ConnectedDevices, WifiNetworks, RssiDevice, CpuUsage, Temperature, MemoryUsage, RxPower, TxPower, Voltage } from '../dataModelTypes';
import { getWifiNetworks } from '../trVersions/tr069';

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
    let devices: ConnectedDevices = []
    const lanDevices = deepFind(jsonData, ['InternetGatewayDevice', 'LANDevice'])
    for (const lanDeviceIndex in lanDevices) {
      const hosts = deepFind(lanDevices[lanDeviceIndex], ["Hosts", "Host"])

      if (hosts === null) continue

      for (const hostIndex in hosts) {
        const host = hosts[hostIndex]
        const active = deepFind(host, ['Active', '_value'])
        if (active === null || !active) continue

        let mac = deepFind(host, ['MACAddress', '_value'])
        mac = standardizeMac(mac)

        let connection: string = 'ethernet'
        let rssi: number | null = null
        let wifiIndex: number | null = null
        
        const layer2Interface = deepFind(host, ['Layer2Interface', '_value']); 
        if (layer2Interface){
          const result = findWifiNetworkByMac(this.getWifiNetworks(jsonData), mac);
          if (result){
            wifiIndex = result.index
            connection = result.connection
            rssi = result.rssi
          }
        }
        devices.push({
          mac: mac,
          wifiIndex: wifiIndex,
          active: true,
          connection: connection,
          rssi: rssi
        })
      }
    }
    return devices; 
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
    const txPowerStr =  deepFind(jsonData, [ 'InternetGatewayDevice', 'WANDevice', '1', 'X_ZTE-COM_WANPONInterfaceConfig', 'TXPower', '_value'])
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