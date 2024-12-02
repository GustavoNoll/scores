import { deepFind, usedPercentByTotalAndFree } from '../convertUtils';
import DataModel from '../dataModel';
import { ConnectedDevices, WifiNetworks, CpuUsage, MemoryUsage, RxPower, TxPower } from '../dataModelTypes';
import { getConnectedDevices, getWifiNetworks } from '../trVersions/tr069';

class TplinkEC200_G5v3 extends DataModel {
  constructor() {
    super({
      manufacturer: 'TP-Link',
      oui: '*',
      productClass: 'IGD',
      modelName: '*',
      hardwareVersion: 'EC220-G5 v2 00000003',
      softwareVersion: '*',
    });
  }

  getConnectedDevices(jsonData: any): ConnectedDevices {
    const wifiNetworks = this.getWifiNetworks(jsonData);
    return getConnectedDevices(jsonData, wifiNetworks);
  }

  getCpuUsage(jsonData: any): CpuUsage {
    const cpuUsage = deepFind(jsonData, ['InternetGatewayDevice', 'DeviceInfo', 'ProcessStatus', 'CPUUsage', '_value']);

    return cpuUsage / 100;
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