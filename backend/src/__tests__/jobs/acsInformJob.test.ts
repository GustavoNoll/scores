import { processAcsInforms } from '../../jobs/acsInformJob';
import AcsInform from '../../database/models/acsInform';
import AcsInformService from '../../services/acsInformService';

jest.mock('../../database/models/acsInform');
jest.mock('../../services/acsInformService');

describe('acsInformJob', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('processes ACS informs in batches', async () => {
    const mockAcsInforms = [
      { id: 1, deviceTag: 'device1' },
      { id: 2, deviceTag: 'device2' },
      { id: 3, deviceTag: 'device3' },
    ];

    (AcsInform.findAll as jest.Mock).mockResolvedValue(mockAcsInforms);
    (AcsInformService.prototype.processAcsInform as jest.Mock).mockResolvedValue(true);

    console.log = jest.fn();
    console.error = jest.fn();

    await processAcsInforms();

    expect(AcsInform.findAll).toHaveBeenCalledWith({
      where: {
        createdAt: expect.any(Object)
      }
    });

    expect(AcsInformService.prototype.processAcsInform).toHaveBeenCalledTimes(3);
    expect(console.log).toHaveBeenCalledWith('Executando processamento de acs informs...');
    expect(console.log).toHaveBeenCalledWith('Encontrados 3 acs informs para processamento.');
    expect(console.log).toHaveBeenCalledWith('Processando batch 1 de 1');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Processamento completo em'));
  });

  it('handles errors during processing', async () => {
    const mockAcsInforms = [
      { id: 1, deviceTag: 'device1' },
      { id: 2, deviceTag: 'device2' },
    ];

    (AcsInform.findAll as jest.Mock).mockResolvedValue(mockAcsInforms);
    (AcsInformService.prototype.processAcsInform as jest.Mock)
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error('Processing error'));

    console.log = jest.fn();
    console.error = jest.fn();

    await processAcsInforms();

    expect(AcsInformService.prototype.processAcsInform).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith('Error processing ACS inform 2:', expect.any(Error));
  });

  it('handles empty ACS inform list', async () => {
    (AcsInform.findAll as jest.Mock).mockResolvedValue([]);

    console.log = jest.fn();

    await processAcsInforms();

    expect(AcsInform.findAll).toHaveBeenCalled();
    expect(AcsInformService.prototype.processAcsInform).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Encontrados 0 acs informs para processamento.');
  });

  it('processes ACS informs in correct batch sizes', async () => {
    const mockAcsInforms = Array(25).fill(null).map((_, i) => ({ id: i + 1, deviceTag: `device${i + 1}` }));

    (AcsInform.findAll as jest.Mock).mockResolvedValue(mockAcsInforms);
    (AcsInformService.prototype.processAcsInform as jest.Mock).mockResolvedValue(true);

    console.log = jest.fn();

    await processAcsInforms();

    expect(console.log).toHaveBeenCalledWith('Processando batch 1 de 3');
    expect(console.log).toHaveBeenCalledWith('Processando batch 2 de 3');
    expect(console.log).toHaveBeenCalledWith('Processando batch 3 de 3');
  });
});