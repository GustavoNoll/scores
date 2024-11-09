interface ExperienceScoreCreateInterface {
  uptime: number;
  txPower: number;
  cpuUsage: number;
  memoryUsage: number;
  rxPower: number;
  temperature: number;
  totalConnectedDevices: number;
  averageWorstRssi: number;
  connectedDevices5gRatio: number;
  rebootCount: number;
  protocolCount: number;
  massiveEventCount: number;
  oltId: number | null;
  ctoId: number | null;
}
export { ExperienceScoreCreateInterface };
