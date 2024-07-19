import { Sequelize } from 'sequelize';
import path from "path";
import fs from 'fs';
import * as config from "../../database/config/database"
import DeviceService from '../../services/deviceService';
import Device from '../../database/models/device';
import Client from '../../database/models/client';
import AcsInform from '../../database/models/acsInform';
import FieldMeasure from '../../database/models/fieldMeasure';

const sequelize = new Sequelize(config);

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('DeviceService', () => {
  let deviceService: DeviceService;

  beforeAll(() => {
    deviceService = new DeviceService();
    
  });
  
  beforeEach(async () => {
    await AcsInform.destroy({ where: {}, truncate: true });
    await Client.destroy({ where: {}, truncate: true, cascade: true });
    await Device.destroy({ where: {}, truncate: true, cascade: true});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processAcsInform', () => {
    it('should create a device if it does not exist and link it to a client', async () => {

      const jsonContent = fs.readFileSync(path.join(__dirname, '../utils/translateFields/informTests/zte_f670l_v9.json'), 'utf-8');

      const data = JSON.parse(jsonContent);
      const acsInformData = {
        deviceTag: 'device123',
        jsonData: data
      };

      const mockAcsInform = await AcsInform.create(acsInformData);


      const client = await Client.create({
        id: 1,
        mac: '00:11:22:33:44:55',
        pppoeUsername: '15107ESTER',
        serialNumber: 'SN12345',
        integrationId: 'mockIntegrationId',
        latitude: '0.0',
        longitude: '0.0'
      });

      await deviceService.processAcsInform(mockAcsInform);

      const device = await Device.findOne({ where: { deviceTag: 'device123' } });
      expect(device).not.toBeNull();
      expect(device?.clientId).toBe(client.id);
      const fieldMeasures = await FieldMeasure.findAll({ where: { deviceId: device?.id } });
      console.log(fieldMeasures)
      expect(fieldMeasures.length).toBeGreaterThan(0);
  
      // Verificar valores específicos dos field measures
      const uptime = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'uptime' } });
      expect(uptime?.value).toBe(28792);
  
      const txPower = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'txPower' } });
      expect(txPower?.value).toBe(2.35);
  
      const cpuUsage = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'cpuUsage' } });
      expect(cpuUsage?.value).toBe(0.07);
  
      const memoryUsage = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'memoryUsage' } });
      expect(memoryUsage?.value).toBe(0.63);
  
      const rxPower = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'rxPower' } });
      expect(rxPower?.value).toBe(-18.12);
  
      const temperature = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'temperature' } });
      expect(temperature?.value).toBe(49.71);

      const totalConnectedDevices = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'totalConnectedDevices' } });
      expect(totalConnectedDevices?.value).toBe(8);

      const connectedDevices2G = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'connectedDevices2G' } });
      expect(connectedDevices2G?.value).toBe(2);

      const connectedDevices5G = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'connectedDevices5G' } });
      expect(connectedDevices5G?.value).toBe(5);

      const autoChannel2G = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'autoChannel2G' } });
      expect(autoChannel2G?.value).toBe(0);

      const autoChannel5G = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'autoChannel5G' } });
      expect(autoChannel5G?.value).toBe(1);

      const averageWorstRssi = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'averageWorstRssi' } });
      expect(averageWorstRssi?.value).toBe(-52.333333333333336);
    });

    it('should update the device if it exists and link it to a client', async () => {

      const jsonContent = fs.readFileSync(path.join(__dirname, '../utils/translateFields/informTests/zte_f670l_v9.json'), 'utf-8');

      const data = JSON.parse(jsonContent);
      const acsInformData = {
        deviceTag: 'device123',
        jsonData: data
      };

      const mockAcsInform = await AcsInform.create(acsInformData);

      const mockDevice = await Device.create({
        manufacturer: "ZTE",
        deviceTag: 'device123',
        oui: "123",
        productClass: "aa",
        modelName: "aaa",
        hardwareVersion: "123",
        softwareVersion: "123",
      });

      const client = await Client.create({
        id: 1,
        mac: '00:11:22:33:44:55',
        pppoeUsername: '15107ESTER',
        serialNumber: 'SN12345',
        integrationId: 'mockIntegrationId',
        latitude: '0.0',
        longitude: '0.0'
      });

      await deviceService.processAcsInform(mockAcsInform);

      const device = await Device.findOne({ where: { deviceTag: 'device123' } });
      expect(device).not.toBeNull();
      expect(device?.clientId).toBe(client.id);

            const uptime = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'uptime' } });
      expect(uptime?.value).toBe(28792);
  
      const txPower = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'txPower' } });
      expect(txPower?.value).toBe(2.35);
  
      const cpuUsage = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'cpuUsage' } });
      expect(cpuUsage?.value).toBe(0.07);
  
      const memoryUsage = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'memoryUsage' } });
      expect(memoryUsage?.value).toBe(0.63);
  
      const rxPower = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'rxPower' } });
      expect(rxPower?.value).toBe(-18.12);
  
      const temperature = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'temperature' } });
      expect(temperature?.value).toBe(49.71);

      const totalConnectedDevices = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'totalConnectedDevices' } });
      expect(totalConnectedDevices?.value).toBe(8);

      const connectedDevices2G = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'connectedDevices2G' } });
      expect(connectedDevices2G?.value).toBe(2);

      const connectedDevices5G = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'connectedDevices5G' } });
      expect(connectedDevices5G?.value).toBe(5);

      const autoChannel2G = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'autoChannel2G' } });
      expect(autoChannel2G?.value).toBe(0);

      const autoChannel5G = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'autoChannel5G' } });
      expect(autoChannel5G?.value).toBe(1);

      const averageWorstRssi = await FieldMeasure.findOne({ where: { deviceId: device?.id, field: 'averageWorstRssi' } });
      expect(averageWorstRssi?.value).toBe(-52.333333333333336);
    });
  });
});