import { Sequelize } from 'sequelize';
import AcsInformService from "../../services/acsInformService";
import path from "path";
import fs from 'fs';
import AcsInform from "../../database/models/acsInform";
import * as config from "../../database/config/database";
import Client from '../../database/models/client';
import Device from '../../database/models/device';
import FieldMeasure from '../../database/models/fieldMeasure';


const sequelize = new Sequelize(config);

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe("AcsInformService", () => {
  let acsInformService: AcsInformService;

  beforeAll(() => {
    acsInformService = new AcsInformService();
  });
  
  beforeEach(async () => {
    await AcsInform.destroy({ where: {}, truncate: true });
    await Client.destroy({ where: {}, truncate: true, cascade: true });
    await Device.destroy({ where: {}, truncate: true, cascade: true});
    await FieldMeasure.destroy({ where: {}, truncate: true, cascade: true});
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
        mac: '00:11:22:33:44:55',
        pppoeUsername: '15107ESTER',
        serialNumber: 'SN12345',
        integrationId: 'mockIntegrationId',
        latitude: '0.0',
        longitude: '0.0'
      });

      await acsInformService.processAcsInform(mockAcsInform);

      const device = await Device.findOne({ where: { deviceTag: 'device123' } });
      expect(device).not.toBeNull();
      expect(device?.clientId).toBe(client.id);
      const fieldMeasures = await FieldMeasure.findAll({ where: { deviceId: device?.id } });

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

      expect((await AcsInform.findAll({ where: {} }))).toHaveLength(0);
    });

    it('should update the device if it exists and link it to a client', async () => {

      const jsonContent = fs.readFileSync(path.join(__dirname, '../utils/translateFields/informTests/zte_f670l_v9.json'), 'utf-8');

      const data = JSON.parse(jsonContent);
      const acsInformData = {
        deviceTag: 'device123',
        jsonData: data
      };

      const mockAcsInform = await AcsInform.create(acsInformData);

      const client = await Client.create({
        mac: '00:11:22:33:44:55',
        pppoeUsername: '15107ESTER',
        serialNumber: 'SN12345',
        integrationId: 'mockIntegrationId',
        latitude: '0.0',
        longitude: '0.0'
      });

      await acsInformService.processAcsInform(mockAcsInform);

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

  describe("get", () => {
    it("should return acs informs successfully", async () => {
      const mockAcsInforms = [{ deviceTag: "aaa", jsonData: {"aa": 123} }];
      await AcsInform.bulkCreate(mockAcsInforms);

      const result = await acsInformService.get();

      expect(result.status).toEqual(200);
      expect(result.message).toBeInstanceOf(Array);
      expect((result.message as AcsInform[]).length).toBeGreaterThan(0);
    });
  });

  describe("create", () => {
    it("should create an acs inform successfully", async () => {
      const mockAcsInform = { deviceTag: "aaa", jsonData: {"aa": 123} };

      const result = await acsInformService.create(mockAcsInform);

      expect(result.status).toEqual(201);
      const acsInform = await AcsInform.findOne({ where: { deviceTag: "aaa" } });
      expect(acsInform?.deviceTag).toBe("aaa");
    });

    it("should handle validation errors", async () => {

      const result = await acsInformService.create({ deviceTag: "1", jsonData: ["a", 1] });

      expect(result.status).toBe(422);
      expect(result.message).toBe("\"jsonData\" must be of type object");
    });
  });
});
