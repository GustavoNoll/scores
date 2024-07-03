import { deepFind, rssiStringTonNumber, standardizeMac } from "../convertUtils";
import { RssiDevice, WifiNetworks } from "../dataModelTypes";

export function getWifiNetworks(json: any, rssiKey: string = 'AssociatedDeviceRssi'): WifiNetworks {
  let wifiNetworks: WifiNetworks = []
  const wlans = deepFind(json, ['InternetGatewayDevice', 'LANDevice', '1', 'WLANConfiguration'])
  if (!wlans) return wifiNetworks
  for (const wlanIndex in wlans){
    let channel = deepFind(wlans[wlanIndex], ['Channel', '_value'])
    if (deepFind(wlans[wlanIndex], ['Status', '_value']) != 'Up')  continue
    if (channel === null) continue
    let wifi_type = (channel >= 36 ? '5G' : '2.4G');

    wifiNetworks.push(
      {
        index: +wlanIndex,
        wifi_type: wifi_type,
        ssid: deepFind(wlans[wlanIndex], ['SSID', '_value']),
        autoChannelEnabled: deepFind(wlans[wlanIndex], ['AutoChannelEnable', '_value']),
        channel: channel,
        rssiDevices: getRssiDevices(wlans[wlanIndex], rssiKey),
      }
    )
  } 
  return wifiNetworks;
}

function getRssiDevices(wlanData: any, rssiKey: string): RssiDevice[] {
  let rssiDevices: RssiDevice[] = []
  const associatedDevices = wlanData?.AssociatedDevice
  for (const index in associatedDevices) {
    let mac = deepFind(associatedDevices[index], ['AssociatedDeviceMACAddress', '_value'])
    let rssi = deepFind(associatedDevices[index], [ rssiKey, '_value'])
    if( mac === null || rssi === null) continue
    rssi = rssiStringTonNumber(rssi)
    mac = standardizeMac(mac)
    rssiDevices.push({ mac, rssi })
  }
  return rssiDevices
}