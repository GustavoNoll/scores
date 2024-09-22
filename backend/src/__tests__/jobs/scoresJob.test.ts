import { processScores } from '../../jobs/scoresJob';
import Device from '../../database/models/device';
import Client from '../../database/models/client';
import ClientScore from '../../database/models/clientScore';
import FieldScore from '../../database/models/fieldScore';
import ExperienceScore from '../../database/models/experienceScore';
import FieldScoreService from '../../services/fieldScoreService';
import FieldScoreRule from '../../database/models/fieldScoreRule';
import FieldMeasure from '../../database/models/fieldMeasure';

jest.mock('../../constants/processConstants', () => ({
  ...jest.requireActual('../../constants/processConstants'),
  MIN_REQUIRED_DIFFERENT_DAYS_OF_A_FIELD_TO_CALCULATE_SCORE: 2
}));
jest.mock('../../database/models/device');
jest.mock('../../database/models/client');
jest.mock('../../database/models/clientScore');
jest.mock('../../database/models/fieldScore');
jest.mock('../../database/models/experienceScore');
jest.mock('../../database/models/fieldScoreRule');
jest.mock('../../database/models/fieldMeasure', () => {
  const actualFieldMeasure = jest.requireActual('../../database/models/fieldMeasure');
  return {
    ...actualFieldMeasure,
    findAll: jest.fn(),
    getFieldMeasureGroupedByDay: jest.fn((measures) => {
      const measuresByDay = new Map<string, number[]>();
      measures.forEach((measure: { createdAt: string | number | Date; value: number; }) => {
        const measureDate = new Date(measure.createdAt).toISOString().split('T')[0];
        if (!measuresByDay.has(measureDate)) {
          measuresByDay.set(measureDate, []);
        }
        measuresByDay.get(measureDate)?.push(measure.value);
      });
      return measuresByDay;
    }),
  };
});

describe('processScores', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('processes scores for clients with devices and experience scores', async () => {
    const mockClients = [
      { id: 1, integrationId: 'INT1', device: { id: 101 } },
      { id: 2, integrationId: 'INT2', device: { id: 102 } },
    ];

    (Client.findAll as jest.Mock).mockResolvedValue(mockClients);
    (ClientScore.findOne as jest.Mock).mockResolvedValue(null);
    (ExperienceScore.getByClient as jest.Mock).mockResolvedValue({ id: 1 });
    (FieldScoreService.prototype.processScores as jest.Mock).mockResolvedValue(true);

    await processScores();

    expect(Client.findAll).toHaveBeenCalledWith({ include: [{ model: Device, as: 'device' }] });
    expect(ClientScore.findOne).toHaveBeenCalledTimes(2);
    expect(ExperienceScore.getByClient).toHaveBeenCalledTimes(2);
    expect(FieldScoreService.prototype.processScores).toHaveBeenCalledTimes(2);
  });

  it('skips processing for clients without devices', async () => {
    const mockClients = [
      { id: 1, integrationId: 'INT1', device: null },
      { id: 2, integrationId: 'INT2', device: { id: 102 } },
    ];

    (Client.findAll as jest.Mock).mockResolvedValue(mockClients);
    (ClientScore.findOne as jest.Mock).mockResolvedValue(null);
    (ExperienceScore.getByClient as jest.Mock).mockResolvedValue({ id: 1 });
    (FieldScoreService.prototype.processScores as jest.Mock).mockResolvedValue(true);

    await processScores();

    expect(FieldScoreService.prototype.processScores).toHaveBeenCalledTimes(1);
  });

  it('skips processing for clients without experience scores', async () => {
    const mockClients = [
      { id: 1, integrationId: 'INT1', device: { id: 101 } },
      { id: 2, integrationId: 'INT2', device: { id: 102 } },
    ];

    (Client.findAll as jest.Mock).mockResolvedValue(mockClients);
    (ClientScore.findOne as jest.Mock).mockResolvedValue(null);
    (ExperienceScore.getByClient as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 1 });
    (FieldScoreService.prototype.processScores as jest.Mock).mockResolvedValue(true);

    console.log = jest.fn();

    await processScores();

    expect(FieldScoreService.prototype.processScores).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith('No ExperienceScore found for client INT1');
  });

  it('skips processing for clients with recent scores', async () => {
    const mockClients = [
      { id: 1, integrationId: 'INT1', device: { id: 101 } },
      { id: 2, integrationId: 'INT2', device: { id: 102 } },
    ];

    (Client.findAll as jest.Mock).mockResolvedValue(mockClients);
    (ClientScore.findOne as jest.Mock).mockResolvedValue({ id: 1 });

    console.log = jest.fn();

    await processScores();

    expect(FieldScoreService.prototype.processScores).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('had a score in the last 12 hours'));
  });

  it('handles errors during processing', async () => {
    const mockClients = [{ id: 1, integrationId: 'INT1', device: { id: 101 } }];

    (Client.findAll as jest.Mock).mockResolvedValue(mockClients);
    (ClientScore.findOne as jest.Mock).mockResolvedValue(null);
    (ExperienceScore.getByClient as jest.Mock).mockResolvedValue({ id: 1 });
    (FieldScoreService.prototype.processScores as jest.Mock).mockRejectedValue(new Error('Test error'));

    console.error = jest.fn();

    await processScores();

    expect(console.error).toHaveBeenCalledWith('Error processing scores for client 1:', expect.any(Error));
  });

  it('continues processing other clients when one client throws an error', async () => {
    const mockClients = [
      { id: 1, integrationId: 'INT1', device: { id: 101 } },
      { id: 2, integrationId: 'INT2', device: { id: 102 } },
      { id: 3, integrationId: 'INT3', device: { id: 103 } },
    ];

    (Client.findAll as jest.Mock).mockResolvedValue(mockClients);
    (ClientScore.findOne as jest.Mock).mockResolvedValue(null);
    (ExperienceScore.getByClient as jest.Mock).mockResolvedValue({ id: 1 });

    const processScoresMock = jest.fn()
      .mockRejectedValueOnce(new Error('Test error for client 1'))
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true);

    (FieldScoreService.prototype.processScores as jest.Mock) = processScoresMock;

    console.error = jest.fn();
    console.log = jest.fn();

    await processScores();

    expect(console.error).toHaveBeenCalledWith(
      'Error processing scores for client 1:',
      expect.any(Error)
    );
    expect(processScoresMock).toHaveBeenCalledTimes(3);
    expect(console.log).toHaveBeenCalledWith('Scores processados com sucesso!');
  });
});

describe('processScores end-to-end', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process scores for multiple clients', async () => {
    const mockClients = [
      { id: 1, integrationId: 'client1', device: { id: 101 } },
    ];

    const mockExperienceScore = {
      uptime: 0.2,
      txPower: 0.1,
      cpuUsage: 0.1,
      memoryUsage: 0.1,
      rxPower: 0.2,
      temperature: 0.1,
      totalConnectedDevices: 0.1,
      averageWorstRssi: 0.05,
      connectedDevices5gRatio: 0.05,
      toJSON: function() { return this; }
    };

    const mockFieldMeasures = [
      { field: 'uptime', value: 25, createdAt: new Date('2023-05-01') },
      { field: 'uptime', value: 50, createdAt: new Date('2023-05-02') },
      { field: 'txPower', value: 10, createdAt: new Date('2023-05-01') },
      { field: 'txPower', value: 20, createdAt: new Date('2023-05-02') },
      { field: 'cpuUsage', value: 50, createdAt: new Date('2023-05-01') },
      { field: 'cpuUsage', value: 60, createdAt: new Date('2023-05-02') },
      { field: 'memoryUsage', value: 70, createdAt: new Date('2023-05-01') },
      { field: 'memoryUsage', value: 80, createdAt: new Date('2023-05-02') }
    ];

    const mockFieldScoreRule = {
      goodThresholdLow: 80,
      criticalThresholdLow: 20,
      goodThresholdHigh: null,
      criticalThresholdHigh: null,
      functionType: 'linear',
    };

    (Client.findAll as jest.Mock).mockResolvedValue(mockClients);
    (ClientScore.findOne as jest.Mock).mockResolvedValue(null);
    (ExperienceScore.getByClient as jest.Mock).mockResolvedValue(mockExperienceScore);
    (FieldMeasure.findAll as jest.Mock).mockResolvedValue(mockFieldMeasures);
    (FieldScoreRule.getFieldScoreRuleForDevice as jest.Mock).mockResolvedValue(mockFieldScoreRule);
    (FieldScore.bulkCreateFieldScores as jest.Mock).mockResolvedValue([
        { field: 'uptime', value: 0.2916666666666667 },
        { field: 'txPower', value: 0 },
        { field: 'cpuUsage', value: 0.5833333333333334 },
        { field: 'memoryUsage', value: 0.9166666666666667 }
    ]);
    (Client.findByPk as jest.Mock).mockResolvedValue(mockClients[0]);
    (ClientScore.createScore as jest.Mock).mockResolvedValue({ score: 0.65 });

    await processScores();

    expect(Client.findAll).toHaveBeenCalledTimes(1);
    expect(ClientScore.findOne).toHaveBeenCalledTimes(1);
    expect(ExperienceScore.getByClient).toHaveBeenCalledTimes(2);
    expect(FieldMeasure.findAll).toHaveBeenCalledTimes(1);
    expect(FieldScoreRule.getFieldScoreRuleForDevice).toHaveBeenCalledTimes(4);
    expect(FieldScore.bulkCreateFieldScores).toHaveBeenCalledTimes(1);
    expect(ClientScore.createScore).toHaveBeenCalledTimes(1);

    const fieldScoreCalls = (FieldScore.bulkCreateFieldScores as jest.Mock).mock.calls;
    expect(fieldScoreCalls[0][0]).toEqual({
      uptime: 0.2916666666666667,
      txPower: 0,
      cpuUsage: 0.5833333333333334,
      memoryUsage: 0.9166666666666667,
    });

    const clientScoreCalls = (ClientScore.createScore as jest.Mock).mock.calls;
    expect(clientScoreCalls[0][0]).toBe(1);
    expect(clientScoreCalls[0][1]).toBeCloseTo(0.4, 1);
  });
});
