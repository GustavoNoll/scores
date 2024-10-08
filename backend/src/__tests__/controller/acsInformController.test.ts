// src/__tests__/acsInformController.test.ts

import { Request, Response, NextFunction } from 'express';
import AcsInformController from '../../controller/acsInformController';
import AcsInformService from '../../services/acsInformService';

// Mocking AcsInformService
jest.mock('../../services/acsInformService');
const MockAcsInformService = AcsInformService as jest.MockedClass<typeof AcsInformService>;

describe('AcsInformController', () => {
  let controller: AcsInformController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNextFunction: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    controller = new AcsInformController();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('should respond with status and message from service', async () => {
      const mockServiceResponse = { status: 200, message: 'Data fetched successfully' };
      MockAcsInformService.prototype.get.mockResolvedValue(mockServiceResponse);

      mockRequest.params = { /* mock params */ };

      await controller.get(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(mockServiceResponse.status);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse.message);
      expect(mockNextFunction).not.toHaveBeenCalled();
    });

    it('should call next function on error', async () => {
      const errorMessage = 'Service error';
      MockAcsInformService.prototype.get.mockRejectedValue(new Error(errorMessage));

      mockRequest.params = { /* mock params */ };

      await controller.get(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockNextFunction).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should respond with status and message from service', async () => {
      const mockRequestBody = { /* mock request body */ };
      const mockServiceResponse = { status: 201, message: 'Data created successfully' };
      MockAcsInformService.prototype.create.mockResolvedValue(mockServiceResponse);

      mockRequest.body = mockRequestBody;

      await controller.create(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(mockServiceResponse.status);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse.message);
      expect(mockNextFunction).not.toHaveBeenCalled();
    });

    it('should call next function on error', async () => {
      const errorMessage = 'Service error';
      MockAcsInformService.prototype.create.mockRejectedValue(new Error(errorMessage));

      mockRequest.body = { /* mock request body */ };

      await controller.create(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockNextFunction).toHaveBeenCalled();
    });
  });
});
