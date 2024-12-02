import { deepFind, findWifiNetworkByMac, rssiStringTonNumber, standardizeMac } from "../convertUtils";
import { ConnectedDevices, RssiDevice, WifiNetworks } from "../dataModelTypes";

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

export function getConnectedDevices(jsonData: any, wifiNetworks: WifiNetworks): ConnectedDevices {
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
      
      const result = findWifiNetworkByMac(wifiNetworks, mac);
      if (result) {
        wifiIndex = result.index
        connection = result.connection
        rssi = result.rssi
      }

      devices.push({
        mac,
        wifiIndex,
        active: true,
        connection,
        rssi
      })
    }
  }
  return devices
}