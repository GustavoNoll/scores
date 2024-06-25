interface CtoCreateInterface {
  integrationId: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface CtoUpdateInterface {
  description: string;
  latitude: number;
  longitude: number;
}

export { CtoCreateInterface, CtoUpdateInterface };