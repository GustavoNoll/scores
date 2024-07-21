import FieldMeasureService from '../../services/fieldMeasureService';
import FieldMeasure from '../../database/models/fieldMeasure';
import Device from '../../database/models/device';
import { TranslateFields } from '../../utils/dataModelTypes';
import Client from '../../database/models/client';

describe('FieldMeasureService', () => {
  let fieldMeasureService: FieldMeasureService;
  let device: Device;

  beforeAll(async () => {
    fieldMeasureService = new FieldMeasureService();
    const client = await Client.create({
      mac: '00:11:22:33:44:55',
      pppoeUsername: '15107ESTER',
      serialNumber: 'SN12345',
      integrationId: 'mockIntegrationId1',
      latitude: '0.0',
      longitude: '0.0'
    });
    device = await Device.create({
      clientId: client.id,
      deviceTag: 'device1234',
      manufacturer: 'ZTE',
      oui: '123',
      productClass: 'aa',
      modelName: 'aaa',
      hardwareVersion: '123',
      softwareVersion: '123'
    });
  });

  afterAll(async () => {
    await FieldMeasure.destroy({ where: {}, truncate: true });
    await Client.destroy({ where: {}, truncate: true, cascade: true });
    await Device.destroy({ where: {}, truncate: true, cascade: true});
  });

  beforeEach(async () => {
  });

  it('should create general field measures for a device', async () => {
    const translatedFields: TranslateFields = {
      cpuUsage: 0.08,
      memoryUsage: 0.63,
      rxPower: -18.12,
      temperature: 49.71,
      txPower: 2.35,
      uptime: 28792,
      voltage: 3190,
      connectedDevices: [],
      wifiNetworks: []
    };

    await fieldMeasureService.generateFieldMeasures(device, translatedFields);

    const fieldMeasures = await FieldMeasure.findAll({ where: { deviceId: device.id } });
    expect(fieldMeasures.length).toBe(13);

    const uptime = await FieldMeasure.findOne({ where: { deviceId: device.id, field: 'uptime' } });
    expect(uptime?.value).toBe(28792);

    const txPower = await FieldMeasure.findOne({ where: { deviceId: device.id, field: 'txPower' } });
    expect(txPower?.value).toBe(2.35);

    const cpuUsage = await FieldMeasure.findOne({ where: { deviceId: device.id, field: 'cpuUsage' } });
    expect(cpuUsage?.value).toBe(0.08);

    const memoryUsage = await FieldMeasure.findOne({ where: { deviceId: device.id, field: 'memoryUsage' } });
    expect(memoryUsage?.value).toBe(0.63);

    const rxPower = await FieldMeasure.findOne({ where: { deviceId: device.id, field: 'rxPower' } });
    expect(rxPower?.value).toBe(-18.12);

    const temperature = await FieldMeasure.findOne({ where: { deviceId: device.id, field: 'temperature' } });
    expect(temperature?.value).toBe(49.71);

    const voltage = await FieldMeasure.findOne({ where: { deviceId: device.id, field: 'voltage' } });
    expect(voltage?.value).toBe(3190);
  });

  it('should create wifi field measures for a device', async () => {
    const translatedFields: TranslateFields = {
      cpuUsage: 0.09,
      memoryUsage: 0.63,
      rxPower: -18.12,
      temperature: 49.71,
      txPower: 2.35,
      uptime: 28792,
      voltage: 3190,
      connectedDevices: [
        {
          rssi: -40,
          wifiIndex: null,
          mac: '',
          active: false,
          connection: ''
        },
        {
          rssi: -50,
          wifiIndex: null,
          mac: '',
          active: false,
          connection: ''
        },
        {
          rssi: -60,
          wifiIndex: null,
          mac: '',
          active: false,
          connection: ''
        }
      ],
      wifiNetworks: [
        {
          wifi_type: '2.4G', autoChannelEnabled: true, rssiDevices: [{
            rssi: -40,
            mac: ''
          }, {
            rssi: -50,
            mac: ''
          }],
          index: 0,
          ssid: '',
          channel: 0
        },
        {
          wifi_type: '5G', autoChannelEnabled: false, rssiDevices: [{
            rssi: -60,
            mac: ''
          }],
          index: 0,
          ssid: '',
          channel: 0
        }
      ]
    };

    await fieldMeasureService.generateFieldMeasures(device, translatedFields);

    const fieldMeasures = await FieldMeasure.findAll({ where: { deviceId: device.id } });
    console.log(fieldMeasures)
    expect(fieldMeasures.length).toBe(26);

    const totalConnectedDevices = await FieldMeasure.findOne({ 
      where: { deviceId: device.id, field: 'totalConnectedDevices' }, order: [['createdAt', 'DESC']], });
    expect(totalConnectedDevices?.value).toBe(3);

    const connectedDevices2G = await FieldMeasure.findOne({ 
      where: { deviceId: device.id, field: 'connectedDevices2G' }, order: [['createdAt', 'DESC']], });
    expect(connectedDevices2G?.value).toBe(2);

    const connectedDevices5G = await FieldMeasure.findOne({ 
      where: { deviceId: device.id, field: 'connectedDevices5G' }, order: [['createdAt', 'DESC']],});
    expect(connectedDevices5G?.value).toBe(1);

    const autoChannel2G = await FieldMeasure.findOne({ where: { deviceId: device.id, field: 'autoChannel2G' }, order: [['createdAt', 'DESC']], });
    expect(autoChannel2G?.value).toBe(1);

    const autoChannel5G = await FieldMeasure.findOne({ where: { deviceId: device.id, field: 'autoChannel5G' }, order: [['createdAt', 'DESC']], });
    expect(autoChannel5G?.value).toBe(0);

    const averageWorstRssi = await FieldMeasure.findOne({ where: { deviceId: device.id, field: 'averageWorstRssi' }, order: [['createdAt', 'DESC']], });
    expect(averageWorstRssi?.value).toBeCloseTo(-50);
  });
});
