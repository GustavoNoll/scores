interface ExperienceScoreCreateInterface {
  uptime: number;
  txPower: number;
  cpuUsage: number;
  memoryUsage: number;
  rxPower: number;
  temperature: number;
  connectedDevices: number;
  rssi: number;
  autoChannel: number;
  highLowBandwidthRatio: number;
  oltId: number | null;
  ctoId: number | null;
}
export { ExperienceScoreCreateInterface };
