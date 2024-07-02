import { deepFind, rssiStringTonNumber } from '../convertUtils';
import DataModel from '../dataModel';
import { Uptime, WifiConnectedDevices, WifiNetworks, RssiDevice } from '../dataModelTypes';

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

  getUptime(jsonData: any): Uptime {
    return jsonData.InternetGatewayDevice?.DeviceInfo?.UpTime?._value || null;
  }

  getWifiConnectedDevices(jsonData: any): WifiConnectedDevices{
    return []; 
  }

  getWifiNetworks(jsonData: any): WifiNetworks{
    let wifiNetworks: WifiNetworks = []
    const wlans = deepFind(jsonData, ['InternetGatewayDevice', 'LANDevice', '1', 'WLANConfiguration'])
    if (!wlans) return wifiNetworks
    for (const wlan in wlans){
      let channel = deepFind(wlans[wlan], ['Channel', '_value'])
      if (deepFind(wlans[wlan], ['Status', '_value']) != 'Up')  continue
      if (channel === null) continue
      let wifi_type = (channel >= 36 ? '5G' : '2.4G');

      wifiNetworks.push(
        {
          index: +wlan,
          wifi_type: wifi_type,
          ssid: deepFind(wlans[wlan], ['SSID', '_value']),
          autoChannelEnabled: deepFind(wlans[wlan], ['AutoChannelEnable', '_value']),
          channel: channel,
          rssiDevices: this.getRssiDevices(wlans[wlan])
        }
      )
    } 
    return wifiNetworks;
  }

  getRssiDevices(wlanData: any): RssiDevice[] {
    let rssiDevices: RssiDevice[] = []
    const associatedDevices = wlanData?.AssociatedDevice
    for (const index in associatedDevices) {
      let mac = deepFind(associatedDevices[index], ['AssociatedDeviceMACAddress', '_value'])
      let rssi = deepFind(associatedDevices[index], ['AssociatedDeviceRssi', '_value'])
      if( mac === null || rssi === null) continue
      rssi = rssiStringTonNumber(rssi)
      rssiDevices.push({ mac, rssi })
    }
    return rssiDevices

  }
}

export default HuaweiWS7001_40Model