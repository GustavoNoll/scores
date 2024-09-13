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
  oltId: number | null;
  ctoId: number | null;
}
export { ExperienceScoreCreateInterface };
