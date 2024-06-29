// src/__tests__/controllers/clientController.test.ts

import { Request, Response, NextFunction } from 'express';
import ClientController from '../../controller/clientController';
import ClientService from '../../services/clientService';

// Mocking ClientService
jest.mock('../../services/clientService');
const MockClientService = ClientService as jest.MockedClass<typeof ClientService>;

describe('ClientController', () => {
  let controller: ClientController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNextFunction: jest.MockedFunction<NextFunction>;
  describe('update', () => {
    it('should respond with status and message from service', async () => {
      const mockRequestBody = { /* mock request body */ };
      const mockServiceResponse = { status: 200, message: 'Client updated successfully' };
      MockClientService.prototype.update.mockResolvedValue(mockServiceResponse);
      mockRequest.body = mockRequestBody;
      mockRequest.params = {}
      await controller.update(mockRequest as Request, mockResponse as Response, mockNextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(mockServiceResponse.status);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse.message);
      expect(mockNextFunction).not.toHaveBeenCalled();
    });
    it('should call next function on error', async () => {
      const errorMessage = 'Service error';
      MockClientService.prototype.update.mockRejectedValue(new Error(errorMessage));
      mockRequest.body = { /* mock request body */ };
      await controller.update(mockRequest as Request, mockResponse as Response, mockNextFunction);
      expect(mockNextFunction).toHaveBeenCalled();
    });
  });
  beforeEach(() => {
    controller = new ClientController();
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
      const mockServiceResponse = { status: 200, message: 'Client data fetched successfully' };
      MockClientService.prototype.get.mockResolvedValue(mockServiceResponse);

      mockRequest.params = { /* mock params */ };

      await controller.get(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(mockServiceResponse.status);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse.message);
      expect(mockNextFunction).not.toHaveBeenCalled();
    });

    it('should call next function on error', async () => {
      const errorMessage = 'Service error';
      MockClientService.prototype.get.mockRejectedValue(new Error(errorMessage));

      mockRequest.params = { /* mock params */ };

      await controller.get(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockNextFunction).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should respond with status and message from service', async () => {
      const mockRequestBody = { /* mock request body */ };
      const mockServiceResponse = { status: 201, message: 'Client created successfully' };
      MockClientService.prototype.create.mockResolvedValue(mockServiceResponse);

      mockRequest.body = mockRequestBody;

      await controller.create(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(mockServiceResponse.status);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse.message);
      expect(mockNextFunction).not.toHaveBeenCalled();
    });

    it('should call next function on error', async () => {
      const errorMessage = 'Service error';
      MockClientService.prototype.create.mockRejectedValue(new Error(errorMessage));

      mockRequest.body = { /* mock request body */ };

      await controller.create(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockNextFunction).toHaveBeenCalled();
    });
  });
});
