import Device from '../../database/models/device';
import DataModel from '../../utils/dataModel';
import HuaweiWS7001_40Model from '../../utils/dataModels/huaweiWS7001-40';

describe('DataModel', () => {
  let dataModel: DataModel;

  beforeEach(() => {
    dataModel = new DataModel({
      manufacturer: 'ACME Corp',
      oui: 'ABC123',
      productClass: 'Router',
      modelName: 'Model X',
      hardwareVersion: '1.0',
      softwareVersion: '2.0',
    });
  });

  it('should match a device with the same properties', () => {
    const device = Device.build({
      manufacturer: 'ACME Corp',
      oui: 'ABC123',
      productClass: 'Router',
      modelName: 'Model X',
      hardwareVersion: '1.0',
      softwareVersion: '2.0',
    });

    expect(dataModel.matches(device)).toBe(true);
  });

  it('should not match a device with a different manufacturer', () => {
    const device = Device.build({
      manufacturer: 'Another Corp',
      oui: 'ABC123',
      productClass: 'Router',
      modelName: 'Model X',
      hardwareVersion: '1.0',
      softwareVersion: '2.0',
    });

    expect(dataModel.matches(device)).toBe(false);
  });

  it('should translate JSON data to the null format', () => {
    const jsonData = {
    };

    const expectedTranslation = {
      cpuUsage: null,
      memoryUsage: null,
      rxPower: null,
      temperature: null,
      txPower: null,
      uptime: null,
      voltage: null,
      wifiConnectedDevices: [],
      wifiNetworks: []
    };

    expect(dataModel.translateFields(jsonData)).toEqual(expectedTranslation);
  });

  it('should return the base device from tr-069JSON data', () => {

    const jsonData = {
      InternetGatewayDevice: {
        DeviceInfo: {
          Manufacturer: { _value: 'ACME Corp' },
          ManufacturerOUI: { _value: 'ABC123'},
          ProductClass: { _value: 'Router' },
          ModelName: {_value: 'Model X' },
          HardwareVersion: { _value: '1.0' },
          SoftwareVersion: { _value: '2.0' },
          SerialNumber: { _value: "aaaa12345678"},
        },
        WANDevice: 
        { '1':
          {
            WANConnectionDevice: {
              '1':
                {
                  WANPPPConnection: {
                    '1': { Username: { _value: 'user1' }, MACAddress: { _value: '00:11:22:33:44:55' } }
                  }
                }
            }
          }
        }
      }
    };

    const expectedBaseDevice = {
      manufacturer: 'ACME Corp',
      oui: 'ABC123',
      productClass: 'Router',
      modelName: 'Model X',
      hardwareVersion: '1.0',
      softwareVersion: '2.0',
      serialNumber: "AAAA12345678",
      pppoeUsername: 'user1',
      mac: '00:11:22:33:44:55',
    };

    expect(DataModel.getBaseDevice(jsonData)).toEqual(expectedBaseDevice);
  });

  it('should return the base device from tr-181 1.0 JSON data', () => {

    const jsonData = {
      Device: {
        DeviceInfo: {
          Manufacturer: { _value: 'ACME Corp' },
          ManufacturerOUI: { _value: 'ABC123'},
          ProductClass: { _value: 'Router' },
          ModelName: {_value: 'Model X' },
          HardwareVersion: { _value: '1.0' },
          SoftwareVersion: { _value: '2.0' },
          SerialNumber: { _value: "aaaa12345678"},
        },
        PPP: {
          Interface: [
            { Username: { _value: 'user2' } }
          ]
        },
        LAN: {
          MACAddress:{ _value:  '66-77-88-99:aa:BB' }
        },
      },
    };

    const expectedBaseDevice = {
      manufacturer: 'ACME Corp',
      oui: 'ABC123',
      productClass: 'Router',
      modelName: 'Model X',
      hardwareVersion: '1.0',
      softwareVersion: '2.0',
      serialNumber: "AAAA12345678",
      pppoeUsername: "user2",
      mac: '66:77:88:99:AA:BB'
    };

    expect(DataModel.getBaseDevice(jsonData)).toEqual(expectedBaseDevice);
  });

  it('should return the base device from tr-181 2.12 JSON data', () => {

    const jsonData = {
      Device: {
        DeviceInfo: {
          Manufacturer: { _value: 'ACME Corp' },
          ManufacturerOUI: { _value: 'ABC123'},
          ProductClass: { _value: 'Router' },
          ModelName: {_value: 'Model X' },
          HardwareVersion: { _value: '1.0' },
          SoftwareVersion: { _value: '2.0' },
          SerialNumber: { _value: "aaaa12345678"},
        },
        Ethernet: {
          Link: [
            { MACAddress: { _value: 'CC:DD:EE:FF:00:11' } }
          ]
        },
        PPP: {
          Interface: [
            { Username: {_value: 'user2'} }
          ]
        },
      }
    };

    const expectedBaseDevice = {
      manufacturer: 'ACME Corp',
      oui: 'ABC123',
      productClass: 'Router',
      modelName: 'Model X',
      hardwareVersion: '1.0',
      softwareVersion: '2.0',
      serialNumber: "AAAA12345678",
      pppoeUsername: 'user2',
      mac: 'CC:DD:EE:FF:00:11'
    };

    expect(DataModel.getBaseDevice(jsonData)).toEqual(expectedBaseDevice);
  });
});