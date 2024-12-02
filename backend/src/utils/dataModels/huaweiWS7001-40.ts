import DataModel from '../dataModel';
import { ConnectedDevices, WifiNetworks } from '../dataModelTypes';
import { getConnectedDevices, getWifiNetworks } from '../trVersions/tr069';

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

  getConnectedDevices(jsonData: any): ConnectedDevices{
    const wifiNetworks = this.getWifiNetworks(jsonData);
    return getConnectedDevices(jsonData, wifiNetworks);
  }

  getWifiNetworks(jsonData: any): WifiNetworks{
    return getWifiNetworks(jsonData)
  }

}

export default HuaweiWS7001_40Model