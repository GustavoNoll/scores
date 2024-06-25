interface OltCreateInterface {
  integrationId: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface OltUpdateInterface {
  description: string;
  latitude: number;
  longitude: number;
}

export { OltCreateInterface, OltUpdateInterface };