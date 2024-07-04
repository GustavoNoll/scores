// dataModelTypes.ts
export type Uptime = number | null;
export type Temperature = number | null;
export type RxPower = number | null;
export type TxPower = number | null;
export type Voltage = number | null;
export type MemoryUsage = number | null;
export type CpuUsage = number | null;
export type WifiConnectedDevices = ConnectedDevice[];
type ConnectedDevice = {
  wifiIndex: number | null,
  mac: string;
  active: boolean;
  connection: string;
  rssi: number | null;
};
export type RssiDevice = {
  mac: string;
  rssi: number | null;
}
export type Network = {
  index: number;
  wifi_type: string;
  ssid: string;
  autoChannelEnabled: boolean;
  channel: number;
  rssiDevices: RssiDevice[];
}
export type WifiNetworks = Network[];
export type TranslateFields = {
  uptime: Uptime; //seconds 
  temperature: Temperature; // celsius
  rxPower: RxPower, // dbm
  txPower: TxPower, // dbm
  voltage: Voltage, // mv
  memoryUsage: MemoryUsage, // 0-1
  cpuUsage: CpuUsage, // 0-1
  wifiConnectedDevices: WifiConnectedDevices,
  wifiNetworks: WifiNetworks
}
export const DataModelTypes = {
  Uptime: null as Uptime,
  Temperature: null as Temperature,
  RxPower: null as RxPower,
  TxPower: null as TxPower,
  Voltage: null as Voltage,
  MemoryUsage: null as MemoryUsage,
  CpuUsage: null as CpuUsage,
  WifiConnectedDevices: [] as WifiConnectedDevices,
  WifiNetworks: [] as WifiNetworks
};
