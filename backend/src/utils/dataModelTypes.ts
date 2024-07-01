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
  mac: string;
  active: boolean;
  connection: string;
  rssi: number | null;
};
type Network = {
  index: number;
  wifi_type: string;
  status: string;
  auto_channel_enabled: boolean;
  channel: number;
}
export type WifiNetworks = Network[];
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
