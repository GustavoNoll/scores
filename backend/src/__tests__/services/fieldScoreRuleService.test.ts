import FieldScoreRuleService from '../../services/fieldScoreRuleService';
import FieldScoreRule from '../../database/models/fieldScoreRule';
import Cto from '../../database/models/cto';  // Substitua pelo caminho correto
import Olt from '../../database/models/olt';  // Substitua pelo caminho correto
import { FieldScoreRuleCreateInterface } from '../../interfaces/fieldScoreRuleInterface';

describe('FieldScoreRuleService', () => {
  let fieldScoreRuleService: FieldScoreRuleService;
  let cto: Cto;
  let olt: Olt;

  beforeAll(async () => {
    fieldScoreRuleService = new FieldScoreRuleService();

    // Criar registros de CTO e OLT para usar nos testes
    cto = await Cto.create({ integrationId: "1", description: "aa", latitude: 5, longitude: 5 });

    olt = await Olt.create({ integrationId: "1", description: "aa", latitude: 5, longitude: 5 });
  });

  afterAll(async () => {
    // Limpeza do banco de dados se necessário
    await FieldScoreRule.destroy({ where: {} });
    await Cto.destroy({ where: {} });
    await Olt.destroy({ where: {} });
  });

  it('should create a new field score rule when one does not exist', async () => {
    const fieldScoreRuleData: FieldScoreRuleCreateInterface = {
      field: 'cpuUsage',
      goodThresholdLow: 80,
      criticalThresholdLow: 10,
      goodThresholdHigh: null,
      criticalThresholdHigh: null,
      functionType: 'linear',
      oltId: olt.id,
      ctoId: cto.id
    };

    const response = await fieldScoreRuleService.create(fieldScoreRuleData);
    expect(response.status).toBe(201);
    expect(response.message).toBeInstanceOf(FieldScoreRule);
    expect((response.message as FieldScoreRule).field).toBe('cpuUsage');
    expect((response.message as FieldScoreRule).goodThresholdLow).toBe(80);
    expect((response.message as FieldScoreRule).functionType).toBe('linear');
  });

  it('should create for nil nil', async () => {
    const fieldScoreRuleData: FieldScoreRuleCreateInterface = {
      field: 'cpuUsage',
      goodThresholdLow: 80,
      criticalThresholdLow: 10,
      goodThresholdHigh: null,
      criticalThresholdHigh: null,
      oltId: null,
      ctoId: null,
      functionType: 'quadratic',
    };

    const response = await fieldScoreRuleService.create(fieldScoreRuleData);
    expect(response.status).toBe(201);
    expect(response.message).toBeInstanceOf(FieldScoreRule);
    expect((response.message as FieldScoreRule).field).toBe('cpuUsage');
    expect((response.message as FieldScoreRule).goodThresholdLow).toBe(80);
    expect((response.message as FieldScoreRule).functionType).toBe('quadratic');
  })

  it('should update an existing field score rule if it already exists', async () => {
    const existingFieldScoreRuleData: FieldScoreRuleCreateInterface = {
      field: 'memoryUsage',
      goodThresholdLow: 75,
      criticalThresholdLow: 5,
      goodThresholdHigh: null,
      criticalThresholdHigh: null,
      functionType: 'quadratic',
      oltId: olt.id,
      ctoId: cto.id
    };

    // Criar uma regra existente
    const response1 = await fieldScoreRuleService.create(existingFieldScoreRuleData);

    expect(response1.status).toBe(201);
    expect(response1.message).toBeInstanceOf(FieldScoreRule);
    expect((response1.message as FieldScoreRule).criticalThresholdLow).toBe(5);
    expect((response1.message as FieldScoreRule).functionType).toBe('quadratic');
    expect((response1.message as FieldScoreRule).oltId).toBe(olt.id);
    expect((response1.message as FieldScoreRule).ctoId).toBe(cto.id);
    const updatedFieldScoreRuleData: FieldScoreRuleCreateInterface = {
      field: 'memoryUsage',
      goodThresholdLow: 80,
      criticalThresholdLow: 10,
      goodThresholdHigh: null,
      criticalThresholdHigh: null,
      functionType: 'cubic',
      oltId: olt.id,
      ctoId: cto.id
    };

    const response2 = await fieldScoreRuleService.create(updatedFieldScoreRuleData);
    expect(response2.status).toBe(200);
    expect(response2.message).toBeInstanceOf(FieldScoreRule);

    expect((response2.message as FieldScoreRule).criticalThresholdLow).toBe(10);
    expect((response2.message as FieldScoreRule).functionType).toBe('cubic');
    expect((response1.message as FieldScoreRule).oltId).toBe(olt.id);
    expect((response1.message as FieldScoreRule).ctoId).toBe(cto.id);


    const records = await FieldScoreRule.findAll({
      where: {
        field: updatedFieldScoreRuleData.field,
        oltId: updatedFieldScoreRuleData.oltId,
        ctoId: updatedFieldScoreRuleData.ctoId
      }
    });
    expect(records).toHaveLength(1)

    const newFieldScoreRuleData: FieldScoreRuleCreateInterface = {
      field: 'memoryUsage',
      goodThresholdLow: 80,
      criticalThresholdLow: 10,
      goodThresholdHigh: null,
      criticalThresholdHigh: null,
      functionType: 'linear',
      oltId: olt.id,
      ctoId: null
    };
    const response3 = await fieldScoreRuleService.create(newFieldScoreRuleData);
    expect(response3.status).toBe(201);
    const records2 = await FieldScoreRule.findAll({
      where: {
        field: updatedFieldScoreRuleData.field,
        oltId: updatedFieldScoreRuleData.oltId,
      }
    });
    expect(records2).toHaveLength(2)

  });

  it('should return a validation error for invalid data', async () => {
    const invalidData = {
      field: 'invalidField', // Assuming 'invalidField' is not allowed by the schema
      goodThresholdLow: 'invalidValue', // Incorrect type
      mediumThreshold: 45,
      poorThreshold: 25,
      criticalThresholdLow: 5,
      progressionRate: 2.0,
      oltId: olt.id,
      ctoId: cto.id
    };

    const response = await fieldScoreRuleService.create(invalidData as any);
    expect(response.status).toBe(422);
    expect(response.message).toEqual({
      "message": "\"field\" must be one of [uptime, txPower, cpuUsage, memoryUsage, rxPower, temperature, totalConnectedDevices, connectedDevices5GPer2G, autoChannel, averageWorstRssi]"
  })
  });

  it('should return a validation error critical > good', async () => {
    const invalidData = {
      field: 'temperature',
      goodThresholdLow: 1,
      criticalThresholdLow: 5,
      goodThresholdHigh: null,
      criticalThresholdHigh: null,
      functionType: 'linear',
      oltId: olt.id,
      ctoId: cto.id
    };

    const response = await fieldScoreRuleService.create(invalidData as any);
    expect(response.status).toBe(422);
    expect(response.message).toEqual({
      "message": "Wrong threshold order"
    })
  });

  it('should return a validation error criticalHigh < goodHigh', async () => {
    const invalidData = {
      field: 'temperature',
      goodThresholdHigh: 5,
      criticalThresholdHigh: 1,
      goodThresholdLow: null,
      criticalThresholdLow: null,
      functionType: 'linear',
      oltId: olt.id,
      ctoId: cto.id
    };

    const response = await fieldScoreRuleService.create(invalidData as any);
    expect(response.status).toBe(422);
    expect(response.message).toEqual({
      "message": "Wrong threshold order"
    })
  });

  it('should return a validation error criticalHigh missing', async () => {
    const invalidData = {
      field: 'temperature',
      goodThresholdHigh: 5,
      goodThresholdLow: null,
      criticalThresholdLow: null,
      criticalThresholdHigh: null,
      functionType: 'linear',
      oltId: olt.id,
      ctoId: cto.id
    };

    const response = await fieldScoreRuleService.create(invalidData as any);
    expect(response.status).toBe(422);
    expect(response.message).toEqual({
      "message": "Missing a threshold"
    })
  });

  it('should retrieve all field score rules', async () => {
    // Ensure there are some rules to retrieve
    const fieldScoreRuleData: FieldScoreRuleCreateInterface = {
      field: 'temperature',
      goodThresholdLow: 30,
      functionType: 'linear',
      criticalThresholdLow: 0,
      oltId: olt.id,
      ctoId: cto.id
    };
    await fieldScoreRuleService.create(fieldScoreRuleData);

    const response = await fieldScoreRuleService.get();
    expect(response.status).toBe(200);
  });
});
