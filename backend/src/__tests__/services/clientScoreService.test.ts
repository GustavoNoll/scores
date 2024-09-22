import ClientScoreService from '../../services/clientScoreService';
import Client from '../../database/models/client';
import ExperienceScore from '../../database/models/experienceScore';
import FieldScore from '../../database/models/fieldScore';
import ClientScore from '../../database/models/clientScore';
import { MIN_REQUIRED_DIFFERENT_VALID_FIELDS_TO_CALCULATE_SCORE } from "../../constants/processConstants";

jest.mock('../../database/models/client');
jest.mock('../../database/models/experienceScore');
jest.mock('../../database/models/fieldScore');
jest.mock('../../database/models/clientScore');

describe('ClientScoreService', () => {
  let clientScoreService: ClientScoreService;

  beforeEach(() => {
    clientScoreService = new ClientScoreService();
    jest.clearAllMocks();
  });

  describe('generateClientScore', () => {
    it('should generate client score successfully', async () => {
      const mockClient = { id: 1 };
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
        toJSON: jest.fn().mockReturnValue({})
      };
      const mockFieldScores = [
        { field: 'uptime', value: 0.9 },
        { field: 'txPower', value: 0.8 },
        { field: 'cpuUsage', value: 0.7 },
        { field: 'memoryUsage', value: 0.6 },
        { field: 'rxPower', value: 0.5 },
      ];

      (Client.findByPk as jest.Mock).mockResolvedValue(mockClient);
      (ExperienceScore.getByClient as jest.Mock).mockResolvedValue(mockExperienceScore);
      (ClientScore.createScore as jest.Mock).mockResolvedValue({ score: 0.7 });

      const result = await clientScoreService.generateClientScore(1, mockFieldScores as FieldScore[]);

      expect(result).toBeCloseTo(0.7, 5);
      expect(Client.findByPk).toHaveBeenCalledWith(1);
      expect(ExperienceScore.getByClient).toHaveBeenCalledWith(mockClient);
      expect(ClientScore.createScore).toHaveBeenCalled();
    });

    it('should throw an error if client is not found', async () => {
      (Client.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(clientScoreService.generateClientScore(1, [])).rejects.toThrow('Client not found');
    });

    it('should throw an error if ExperienceScore is not found', async () => {
      const mockClient = { id: 1 };
      (Client.findByPk as jest.Mock).mockResolvedValue(mockClient);
      (ExperienceScore.getByClient as jest.Mock).mockResolvedValue(null);

      await expect(clientScoreService.generateClientScore(1, [])).rejects.toThrow('ExperienceScore not found for client');
    });

    it('deve lançar um erro quando não há campos de score válidos suficientes', async () => {
      const mockClient = { id: 1 };
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
        toJSON: jest.fn().mockReturnValue({})
      };
      const mockFieldScores = [
        { field: 'uptime', value: 0.9 },
        { field: 'txPower', value: null },
        { field: 'cpuUsage', value: null },
        { field: 'memoryUsage', value: null },
        { field: 'rxPower', value: null },
      ];

      (Client.findByPk as jest.Mock).mockResolvedValue(mockClient);
      (ExperienceScore.getByClient as jest.Mock).mockResolvedValue(mockExperienceScore);

      await expect(clientScoreService.generateClientScore(1, mockFieldScores as FieldScore[]))
        .rejects.toThrow(`Não foi possível calcular o score do cliente: número insuficiente de campos válidos. Necessário: ${MIN_REQUIRED_DIFFERENT_VALID_FIELDS_TO_CALCULATE_SCORE}, Encontrado: 1`);

      expect(Client.findByPk).toHaveBeenCalledWith(1);
      expect(ExperienceScore.getByClient).toHaveBeenCalledWith(mockClient);
      expect(ClientScore.createScore).not.toHaveBeenCalled();
    });

    it('deve calcular o score corretamente quando há exatamente o número mínimo de campos válidos', async () => {
      const mockClient = { id: 1 };
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
        toJSON: jest.fn().mockReturnValue({})
      };

      const mockFieldScores = [
        { field: 'uptime', value: 0.9 },
        { field: 'txPower', value: 0.5 },
      ];
      (Client.findByPk as jest.Mock).mockResolvedValue(mockClient);
      (ExperienceScore.getByClient as jest.Mock).mockResolvedValue(mockExperienceScore);
      (ClientScore.createScore as jest.Mock).mockResolvedValue({ score: 0.5 });

      const result = await clientScoreService.generateClientScore(1, mockFieldScores as FieldScore[]);

      expect(result).toBeCloseTo(0.76, 1);
      expect(ClientScore.createScore).toHaveBeenCalled();
    });

    it('deve ignorar campos não presentes no ExperienceScore', async () => {
      const mockClient = { id: 1 };
      const mockExperienceScore = {
        uptime: 0.2,
        txPower: 0.1,
        cpuUsage: 0.1,
        toJSON: jest.fn().mockReturnValue({})
      };
      const mockFieldScores = [
        { field: 'uptime', value: 0.9 },
        { field: 'txPower', value: 0.8 },
        { field: 'cpuUsage', value: 0.7 },
        { field: 'nonExistentField', value: 1.0 },
      ];

      (Client.findByPk as jest.Mock).mockResolvedValue(mockClient);
      (ExperienceScore.getByClient as jest.Mock).mockResolvedValue(mockExperienceScore);
      (ClientScore.createScore as jest.Mock).mockResolvedValue({ score: 0.24 });

      const result = await clientScoreService.generateClientScore(1, mockFieldScores as FieldScore[]);

      expect(result).toBeCloseTo(0.825, 5);
      expect(ClientScore.createScore).toHaveBeenCalled();
    });

    it('deve lidar corretamente com valores de campo zero', async () => {
      const mockClient = { id: 1 };
      const mockExperienceScore = {
        uptime: 0.2,
        txPower: 0.1,
        cpuUsage: 0.5,
        memoryUsage: 0.1,
        rxPower: 0.1,
        toJSON: jest.fn().mockReturnValue({})
      };
      const mockFieldScores = [
        { field: 'uptime', value: 0 },
        { field: 'txPower', value: 0.5 },
        { field: 'cpuUsage', value: 1 },
        { field: 'memoryUsage', value: 0.75 },
        { field: 'rxPower', value: 0 },
      ];

      (Client.findByPk as jest.Mock).mockResolvedValue(mockClient);
      (ExperienceScore.getByClient as jest.Mock).mockResolvedValue(mockExperienceScore);
      (ClientScore.createScore as jest.Mock).mockResolvedValue({ score: 0.225 });

      const result = await clientScoreService.generateClientScore(1, mockFieldScores as FieldScore[]);

      expect(result).toBeCloseTo(0.625, 5);
      expect(ClientScore.createScore).toHaveBeenCalled();
    });

    it('deve incluir rebootCount no cálculo do score do cliente', async () => {
      const mockClient = { id: 1 };
      const mockExperienceScore = {
        uptime: 0.2,
        txPower: 0.1,
        cpuUsage: 0.1,
        memoryUsage: 0.1,
        rxPower: 0.2,
        rebootCount: 0.3,
        toJSON: jest.fn().mockReturnValue({})
      };
      const mockFieldScores = [
        { field: 'uptime', value: 0.9 },
        { field: 'txPower', value: 0.8 },
        { field: 'cpuUsage', value: 0.7 },
        { field: 'memoryUsage', value: 0.6 },
        { field: 'rxPower', value: 0.5 },
        { field: 'rebootCount', value: 0.4 },
      ];

      (Client.findByPk as jest.Mock).mockResolvedValue(mockClient);
      (ExperienceScore.getByClient as jest.Mock).mockResolvedValue(mockExperienceScore);
      (ClientScore.createScore as jest.Mock).mockResolvedValue({ score: 0.65 });

      const result = await clientScoreService.generateClientScore(1, mockFieldScores as FieldScore[]);

      expect(result).toBeCloseTo(0.61, 5);
      expect(ClientScore.createScore).toHaveBeenCalledWith(
        1,
        0.61,
        expect.objectContaining({
          uptime: 0.9,
          txPower: 0.8,
          cpuUsage: 0.7,
          memoryUsage: 0.6,
          rxPower: 0.5,
          rebootCount: 0.4
        }),
        {}
      );
    });

    it('deve calcular corretamente o score quando rebootCount está presente mas outros campos estão ausentes', async () => {
      const mockClient = { id: 1 };
      const mockExperienceScore = {
        uptime: 0.2,
        rebootCount: 0.8,
        toJSON: jest.fn().mockReturnValue({})
      };
      const mockFieldScores = [
        { field: 'uptime', value: 0.9 },
        { field: 'rebootCount', value: 0.1 },
      ];

      (Client.findByPk as jest.Mock).mockResolvedValue(mockClient);
      (ExperienceScore.getByClient as jest.Mock).mockResolvedValue(mockExperienceScore);
      (ClientScore.createScore as jest.Mock).mockResolvedValue({ score: 0.26 });

      const result = await clientScoreService.generateClientScore(1, mockFieldScores as FieldScore[]);

      expect(result).toBeCloseTo(0.26, 5);
      expect(ClientScore.createScore).toHaveBeenCalledWith(
        1,
        0.26,
        expect.objectContaining({
          uptime: 0.9,
          rebootCount: 0.1
        }),
        {}
      );
    });
  });
});