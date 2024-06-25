interface ClientInterface {
  integrationId: string;
  name?: string;
  latitude: number;
  longitude: number;
  pppoeUsername: string;
  serialNumber?: string;
  mac?: string;
  ctoIntegrationId: number;
  oltIntegrationId: number;
  active: boolean;
}
export default ClientInterface;