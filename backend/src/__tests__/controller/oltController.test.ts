// src/__tests__/controllers/oltController.test.ts

import { Request, Response, NextFunction } from 'express';
import OltController from '../../controller/oltController';
import OltService from '../../services/oltService';

// Mocking OltService
jest.mock('../../services/oltService');
const MockOltService = OltService as jest.MockedClass<typeof OltService>;

describe('OltController', () => {
  let controller: OltController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNextFunction: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    controller = new OltController();
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
      const mockServiceResponse = { status: 200, message: 'Olt data fetched successfully' };
      MockOltService.prototype.get.mockResolvedValue(mockServiceResponse);

      mockRequest.params = { /* mock params */ };

      await controller.get(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(mockServiceResponse.status);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse.message);
      expect(mockNextFunction).not.toHaveBeenCalled();
    });

    it('should call next function on error', async () => {
      const errorMessage = 'Service error';
      MockOltService.prototype.get.mockRejectedValue(new Error(errorMessage));

      mockRequest.params = { /* mock params */ };

      await controller.get(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockNextFunction).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should respond with status and message from service', async () => {
      const mockRequestBody = { latitude: 5, longitude: 5, integrationId: 1 };
      const mockServiceResponse = { status: 201, message: 'Olt created successfully' };
      MockOltService.prototype.create.mockResolvedValue(mockServiceResponse);

      mockRequest.body = mockRequestBody;

      await controller.create(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(mockServiceResponse.status);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse.message);
      expect(mockNextFunction).not.toHaveBeenCalled();
    });

    it('should call next function on error', async () => {
      const errorMessage = 'Service error';
      MockOltService.prototype.create.mockRejectedValue(new Error(errorMessage));

      mockRequest.body = { latitude: 5, longitude: 5, integrationId: 1 };

      await controller.create(mockRequest as Request, mockResponse as Response, mockNextFunction);

      expect(mockNextFunction).toHaveBeenCalled();
    });
  });
  describe('update', () => {
    it('should respond with status and message from service', async () => {
      const mockRequestBody = { latitude: 1, longitude: 1 };
      const mockServiceResponse = { status: 200, message: 'Olt updated successfully' };
      MockOltService.prototype.update.mockResolvedValue(mockServiceResponse);
      mockRequest.body = mockRequestBody;
      mockRequest.params = { integrationId: '1' }
      await controller.update(mockRequest as Request, mockResponse as Response, mockNextFunction);
      expect(mockResponse.status).toHaveBeenCalledWith(mockServiceResponse.status);
      expect(mockResponse.json).toHaveBeenCalledWith(mockServiceResponse.message);
      expect(mockNextFunction).not.toHaveBeenCalled();
    });
    it('should call next function on error', async () => {
      const errorMessage = 'Service error';
      MockOltService.prototype.update.mockRejectedValue(new Error(errorMessage));
      await controller.update(mockRequest as Request, mockResponse as Response, mockNextFunction);
      expect(mockNextFunction).toHaveBeenCalled();
    });
  });
});
