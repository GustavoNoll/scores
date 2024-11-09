interface ClientInterface {
  integrationId: string;
  name?: string;
  latitude: number;
  longitude: number;
  pppoeUsername: string;
  serialNumber?: string;
  mac?: string;
  ctoIntegrationId: string;
  oltIntegrationId: string;
  active: boolean;
}
interface ProtocolInterface {
  createdAt: Date;
}
interface MassiveInterface {
  createdAt: Date;
}
export { ClientInterface, ProtocolInterface, MassiveInterface };
