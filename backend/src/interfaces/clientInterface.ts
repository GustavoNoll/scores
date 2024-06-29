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
export default ClientInterface;