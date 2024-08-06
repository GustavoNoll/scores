import ExperienceScoreService from '../../services/experienceScoreService';
import ExperienceScore from '../../database/models/experienceScore';
import Cto from '../../database/models/cto';
import Olt from '../../database/models/olt';
import { ExperienceScoreCreateInterface } from '../../interfaces/experienceScoreInterface';

describe('ExperienceScoreService', () => {
  let experienceScoreService: ExperienceScoreService;
  let cto: Cto;
  let olt: Olt;

  beforeAll(async () => {
    experienceScoreService = new ExperienceScoreService();

    // Criar registros de CTO e OLT para usar nos testes
    cto = await Cto.create({ integrationId: "1", description: "aa", latitude: 5, longitude: 5 });
    olt = await Olt.create({ integrationId: "1", description: "aa", latitude: 5, longitude: 5 });
  });
  beforeEach(async () => {
    await ExperienceScore.destroy({ where: {} });
  });

  afterAll(async () => {
    // Limpeza do banco de dados
    await ExperienceScore.destroy({ where: {} });
    await Cto.destroy({ where: {} });
    await Olt.destroy({ where: {} });
  });

  it('should create a new experience score when one does not exist', async () => {
    const experienceScoreData: ExperienceScoreCreateInterface = {
      uptime: 0.1,
      txPower: 0.1,
      cpuUsage: 0.1,
      memoryUsage: 0.1,
      rxPower: 0.1,
      temperature: 0.1,
      connectedDevices: 0.1,
      rssi: 0.1,
      autoChannel: 0.1,
      highLowBandwidthRatio: 0.1,
      oltId: null,
      ctoId: null
    };

    const response = await experienceScoreService.create(experienceScoreData);
    expect(response.status).toBe(201);
    expect(response.message).toMatchObject(experienceScoreData);
  });

  it('should update an existing experience score if one already exists', async () => {
    // Primeiro, crie um registro
    const initialData: ExperienceScoreCreateInterface = {
      uptime: 0.1,
      txPower: 0,
      cpuUsage: 0.05,
      memoryUsage: 0.05,
      rxPower: 0.2,
      temperature: 0.05,
      connectedDevices: 0.1,
      rssi: 0.3,
      autoChannel: 0.05,
      highLowBandwidthRatio: 0.1,
      oltId: olt.id,
      ctoId: null
    };

    const r = await experienceScoreService.create(initialData);
    expect(r.status).toBe(201);
    expect(r.message).toMatchObject(initialData);
    // Agora, atualize o registro
    const updatedData: ExperienceScoreCreateInterface = {
      uptime: 0.05,
      txPower: 0.05,
      cpuUsage: 0.05,
      memoryUsage: 0.15,
      rxPower: 0.1,
      temperature: 0.1,
      connectedDevices: 0.1,
      rssi: 0.2,
      autoChannel: 0.1,
      highLowBandwidthRatio: 0.1,
      oltId: olt.id,
      ctoId: null
    };

    const response = await experienceScoreService.create(updatedData);
    expect(response.status).toBe(200);
    expect(response.message).toMatchObject(updatedData);

    const initialData2: ExperienceScoreCreateInterface = {
      uptime: 0.1,
      txPower: 0,
      cpuUsage: 0.05,
      memoryUsage: 0.05,
      rxPower: 0.2,
      temperature: 0.05,
      connectedDevices: 0.1,
      rssi: 0.3,
      autoChannel: 0.05,
      highLowBandwidthRatio: 0.1,
      oltId: olt.id,
      ctoId: cto.id
    };

    const r1 = await experienceScoreService.create(initialData2);
    expect(r1.status).toBe(201);
    expect(r1.message).toMatchObject(initialData2);

    const initialData3: ExperienceScoreCreateInterface = {
      uptime: 0.1,
      txPower: 0,
      cpuUsage: 0.05,
      memoryUsage: 0.05,
      rxPower: 0.2,
      temperature: 0.05,
      connectedDevices: 0.1,
      rssi: 0.3,
      autoChannel: 0.05,
      highLowBandwidthRatio: 0.1,
      oltId: null,
      ctoId: cto.id
    };

    const r2 = await experienceScoreService.create(initialData3);
    expect(r2.status).toBe(201);
    expect(r2.message).toMatchObject(initialData3);

  });

  it('should handle validation errors for incorrect sum', async () => {
    const invalidData: ExperienceScoreCreateInterface = {
      uptime: 1,
      txPower: 0.0001,
      cpuUsage: 0,
      memoryUsage: 0,
      rxPower: 0,
      temperature: 0,
      connectedDevices: 0,
      rssi: 0,
      autoChannel: 0,
      highLowBandwidthRatio: 0,
      oltId: olt.id,
      ctoId: cto.id
    };

    const response = await experienceScoreService.create(invalidData);

    expect(response.status).toBe(422);
    expect(response.message).toStrictEqual({"message": "The sum of all fields must be equal to 1, actual sum is: 1.0001"});
  });

  it('should handle errors during creation or updating', async () => {
    // Mockando erro de criação
    jest.spyOn(ExperienceScore, 'create').mockRejectedValue(new Error('Database error'));
    const experienceScoreData: ExperienceScoreCreateInterface = {
      uptime: 0.1,
      txPower: 0.1,
      cpuUsage: 0.1,
      memoryUsage: 0.1,
      rxPower: 0.1,
      temperature: 0.1,
      connectedDevices: 0.1,
      rssi: 0.1,
      autoChannel: 0.1,
      highLowBandwidthRatio: 0.1,
      oltId: olt.id,
      ctoId: cto.id
    };

    const response = await experienceScoreService.create(experienceScoreData);
    expect(response.message).toBe('Database error');
    expect(ExperienceScore.create).toHaveBeenCalled();
  });
});
