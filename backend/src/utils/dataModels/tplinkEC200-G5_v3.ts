import { deepFind, findWifiNetworkByMac, rssiStringTonNumber, standardizeMac, stringPercentToFloat, stringToFloat, usedPercentByTotalAndFree } from '../convertUtils';
import DataModel from '../dataModel';
import { Uptime, WifiConnectedDevices, WifiNetworks, RssiDevice, CpuUsage, Temperature, MemoryUsage, RxPower, TxPower } from '../dataModelTypes';
import { getWifiNetworks } from '../trVersions/tr069';

class TplinkEC200_G5v3 extends DataModel {
  constructor() {
    super({
      manufacturer: 'TP-Link',
      oui: '00259E',
      productClass: 'IGD',
      modelName: 'F670L',
      hardwareVersion: 'EC220-G5 v2 00000003',
      softwareVersion: '1.4',
    });
  }

  getWifiConnectedDevices(jsonData: any): WifiConnectedDevices{
    let devices: WifiConnectedDevices = []
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
        
        
        const result = findWifiNetworkByMac(this.getWifiNetworks(jsonData), mac);
        if (result){
          wifiIndex = result.index
          connection = result.connection
          rssi = result.rssi
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
    const cpuUsage = deepFind(jsonData, ['InternetGatewayDevice', 'DeviceInfo', 'ProcessStatus', 'CPUUsage', '_value']);

    return cpuUsage;
  }

  
  getMemoryUsage(jsonData: any): MemoryUsage {
    const memoryTotalStr = deepFind(jsonData, ['InternetGatewayDevice', 'DeviceInfo', 'MemoryStatus', 'Total', '_value']);
    const memoryFreeStr = deepFind(jsonData, ['InternetGatewayDevice', 'DeviceInfo', 'MemoryStatus', 'Free', '_value']);

    return usedPercentByTotalAndFree(memoryTotalStr, memoryFreeStr)
  }

  getRxPower(jsonData: any): RxPower {
    const rxPower = deepFind(jsonData, [
      'InternetGatewayDevice', 'LANDevice', '1',
      'WLANConfiguration','1', 'AssociatedDevice','1',
      'X_TP_RxRate', '_value']
    )

    return rxPower; 
  }

  getTxPower(jsonData: any): TxPower {
    const txPower = deepFind(jsonData, [
      'InternetGatewayDevice', 'LANDevice', '1',
      'WLANConfiguration','1', 'AssociatedDevice','1',
      'X_TP_TxRate', '_value']
    )
    return txPower;
  }

  getWifiNetworks(jsonData: any): WifiNetworks{
    return getWifiNetworks(jsonData, 'X_TP_StaSignalStrength')
  }
}

export default TplinkEC200_G5v3