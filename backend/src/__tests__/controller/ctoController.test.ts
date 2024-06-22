// src/__tests__/controllers/ctoController.test.ts

import { Request, Response, NextFunction } from 'express';
import CtoController from '../../controller/ctoController';
import CtoService from '../../services/ctoService';

// Mocking CtoService
jest.mock('../../services/ctoService');
const MockCtoService = CtoService as jest.MockedClass<typeof CtoService>;

describe('CtoController', () => {
  let controller: CtoController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNextFunction: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    controller = new CtoController();
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
      const mockServiceResponse = { status: 200, message: 'Cto data fetched successfully' };
      MockCtoService.prototype.get.mockResolvedValue(mockServiceResponse);

      mockRequest.params = { /* mock params */ };

      await controller.get(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(mockServiceResponse.status);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse.message);
      expect(mockNextFunction).not.toHaveBeenCalled();
    });

    it('should call next function on error', async () => {
      const errorMessage = 'Service error';
      MockCtoService.prototype.get.mockRejectedValue(new Error(errorMessage));

      mockRequest.params = { /* mock params */ };

      await controller.get(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockNextFunction).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should respond with status and message from service', async () => {
      const mockRequestBody = { /* mock request body */ };
      const mockServiceResponse = { status: 201, message: 'Cto created successfully' };
      MockCtoService.prototype.create.mockResolvedValue(mockServiceResponse);

      mockRequest.body = mockRequestBody;

      await controller.create(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(mockServiceResponse.status);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse.message);
      expect(mockNextFunction).not.toHaveBeenCalled();
    });

    it('should call next function on error', async () => {
      const errorMessage = 'Service error';
      MockCtoService.prototype.create.mockRejectedValue(new Error(errorMessage));

      mockRequest.body = { /* mock request body */ };

      await controller.create(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockNextFunction).toHaveBeenCalled();
    });
  });
});
