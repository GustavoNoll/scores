import { processScores } from '../../jobs/scoresJob';
import Device from '../../database/models/device';
import Client from '../../database/models/client';
import ClientScore from '../../database/models/clientScore';
import FieldScoreService from '../../services/fieldScoreService';

jest.mock('../../database/models/device');
jest.mock('../../database/models/client');
jest.mock('../../database/models/clientScore');
jest.mock('../../services/fieldScoreService');

describe('processScores', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('processes scores for clients with devices', async () => {
    const mockClients = [
      { id: 1, device: { id: 101 } },
      { id: 2, device: { id: 102 } },
    ];

    (Client.findAll as jest.Mock).mockResolvedValue(mockClients);
    (ClientScore.findOne as jest.Mock).mockResolvedValue(null);
    (FieldScoreService.prototype.processScores as jest.Mock).mockResolvedValue(undefined);

    await processScores();

    expect(Client.findAll).toHaveBeenCalledWith({ include: [{ model: Device, as: 'device' }] });
    expect(ClientScore.findOne).toHaveBeenCalledTimes(2);
    expect(FieldScoreService.prototype.processScores).toHaveBeenCalledTimes(2);
  });

  it('skips processing for clients without devices', async () => {
    const mockClients = [
      { id: 1, device: null },
      { id: 2, device: { id: 102 } },
    ];

    (Client.findAll as jest.Mock).mockResolvedValue(mockClients);
    (ClientScore.findOne as jest.Mock).mockResolvedValue(null);
    (FieldScoreService.prototype.processScores as jest.Mock).mockResolvedValue(undefined);

    await processScores();

    expect(FieldScoreService.prototype.processScores).toHaveBeenCalledTimes(1);
  });

  it('skips processing for clients with recent scores', async () => {
    const mockClients = [
      { id: 1, device: { id: 101 } },
      { id: 2, device: { id: 102 } },
    ];

    (Client.findAll as jest.Mock).mockResolvedValue(mockClients);
    (ClientScore.findOne as jest.Mock).mockResolvedValue({ id: 1 });
    (FieldScoreService.prototype.processScores as jest.Mock).mockResolvedValue(undefined);

    await processScores();

    expect(FieldScoreService.prototype.processScores).not.toHaveBeenCalled();
  });

  it('handles errors during processing', async () => {
    const mockClients = [{ id: 1, device: { id: 101 } }];

    (Client.findAll as jest.Mock).mockResolvedValue(mockClients);
    (ClientScore.findOne as jest.Mock).mockResolvedValue(null);
    (FieldScoreService.prototype.processScores as jest.Mock).mockRejectedValue(new Error('Test error'));

    console.error = jest.fn();

    await processScores();

    expect(console.error).toHaveBeenCalledWith('Error processing scores for client 1:', expect.any(Error));
  });

  it('continues processing other clients when one client throws an error', async () => {
    const mockClients = [
      { id: 1, device: { id: 101 }, integrationId: 'INT1' },
      { id: 2, device: { id: 102 }, integrationId: 'INT2' },
      { id: 3, device: { id: 103 }, integrationId: 'INT3' },
    ];

    (Client.findAll as jest.Mock).mockResolvedValue(mockClients);
    (ClientScore.findOne as jest.Mock).mockResolvedValue(null);

    const processScoresMock = jest.fn()
      .mockRejectedValueOnce(new Error('Test error for client 1'))
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);

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
