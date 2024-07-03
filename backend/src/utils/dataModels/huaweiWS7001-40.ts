import { deepFind, findWifiNetworkByMac, rssiStringTonNumber, standardizeMac } from '../convertUtils';
import DataModel from '../dataModel';
import { Uptime, WifiConnectedDevices, WifiNetworks, RssiDevice } from '../dataModelTypes';
import { getWifiNetworks } from '../trVersions/tr069';

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

  getWifiNetworks(jsonData: any): WifiNetworks{
    return getWifiNetworks(jsonData)
  }

}

export default HuaweiWS7001_40Model