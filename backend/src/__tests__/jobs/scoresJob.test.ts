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

    expect(console.error).toHaveBeenCalledWith('Error processing scores:', expect.any(Error));
  });
});
