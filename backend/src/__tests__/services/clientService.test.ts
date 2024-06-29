import { UniqueConstraintError } from "sequelize";
import ClientService from "../../services/clientService";
import Client from "../../database/models/client";
import schema from "../../services/validations/clientSchema";
import resp from "../../utils/resp";
import respM from "../../utils/respM";
import Olt from "../../database/models/olt";
import Cto from "../../database/models/cto";

jest.mock("../../database/models/client");
jest.mock("../../services/validations/clientSchema");
jest.mock("../../utils/resp");
jest.mock("../../utils/respM");
jest.mock("../../database/models/olt");
jest.mock("../../database/models/cto");

describe("ClientService", () => {
  let clientService: ClientService;

  beforeEach(() => {
    clientService = new ClientService();
  });

  describe("get", () => {
    it("should return clients successfully", async () => {
      const mockClients = [{ id: 1 }];
      (Client.findAll as jest.Mock).mockResolvedValue(mockClients);
      (resp as jest.Mock).mockReturnValue({ status: 200, data: mockClients });

      const result = await clientService.get();

      expect(Client.findAll).toHaveBeenCalledWith({ where: undefined, raw: true });
      expect(resp).toHaveBeenCalledWith(200, mockClients);
      expect(result).toEqual({ status: 200, data: mockClients });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      (Client.findAll as jest.Mock).mockRejectedValue(error);
      (resp as jest.Mock).mockReturnValue({ status: 500, message: "Error retrieving Clients", error });

      const result = await clientService.get();

      expect(resp).toHaveBeenCalledWith(500, { message: "Error retrieving Clients", error });
      expect(result).toEqual({ status: 500, message: "Error retrieving Clients", error });
    });
  });

  describe("create", () => {
    it("should create a client successfully", async () => {
      const mockClient = { 
        integrationId: "1", 
        ctoIntegrationId: "1", 
        oltIntegrationId: "1",
        latitude: 0,
        longitude: 0,
        pppoeUsername: "",
        active: false
      };
      const mockCto = { id: 1 };
      const mockOlt = { id: 1 };
      const createdClient = { ...mockClient, id: 1, ctoId: mockCto.id, oltId: mockOlt.id };
      
      (schema.clientCreate.validate as jest.Mock).mockReturnValue({ error: null });
      (Cto.findOne as jest.Mock).mockResolvedValue(mockCto);
      (Olt.findOne as jest.Mock).mockResolvedValue(mockOlt);
      (Client.create as jest.Mock).mockResolvedValue(createdClient);
      (resp as jest.Mock).mockReturnValue({ status: 201, data: createdClient });
    
      const result = await clientService.create(mockClient);
    
      expect(Cto.findOne).toHaveBeenCalledWith({ where: { integrationId: mockClient.ctoIntegrationId } });
      expect(Olt.findOne).toHaveBeenCalledWith({ where: { integrationId: mockClient.oltIntegrationId } });
      expect(Client.create).toHaveBeenCalledWith({
        ...mockClient,
        ctoId: mockCto.id,
        oltId: mockOlt.id
      });
      expect(resp).toHaveBeenCalledWith(201, createdClient);
      expect(result).toEqual({ status: 201, data: createdClient });
    });

    it("should handle validation errors", async () => {
      const error = { message: "Validation error" };
      (schema.clientCreate.validate as jest.Mock).mockReturnValue({ error });
      (respM as jest.Mock).mockReturnValue({ status: 422, message: error.message });

      const result = await clientService.create({
        integrationId: "",
        ctoIntegrationId: "",
        oltIntegrationId: "",
        latitude: 0,
        longitude: 0,
        pppoeUsername: "",
        active: false
      });

      expect(respM).toHaveBeenCalledWith(422, error.message);
      expect(result).toEqual({ status: 422, message: error.message });
    });

    it("should handle CTO not found error", async () => {
      const mockClient = { 
        integrationId: "1", ctoIntegrationId: "1", oltIntegrationId: "1",
        latitude: 0,
        longitude: 0,
        pppoeUsername: "",
        active: false
      };
      (schema.clientCreate.validate as jest.Mock).mockReturnValue({ error: null });
      (Cto.findOne as jest.Mock).mockResolvedValue(null);
      (respM as jest.Mock).mockReturnValue({ status: 404, message: "CTO not found" });

      const result = await clientService.create(mockClient);

      expect(Cto.findOne).toHaveBeenCalledWith({ where: { integrationId: mockClient.ctoIntegrationId } });
      expect(respM).toHaveBeenCalledWith(404, "CTO not found");
      expect(result).toEqual({ status: 404, message: "CTO not found" });
    });

    it("should handle OLT not found error", async () => {
      const mockClient = { 
        integrationId: "1", ctoIntegrationId: "1", oltIntegrationId: "1",
        latitude: 0,
        longitude: 0,
        pppoeUsername: "",
        active: false
      };
      const mockCto = { id: 1 };

      (schema.clientCreate.validate as jest.Mock).mockReturnValue({ error: null });
      (Cto.findOne as jest.Mock).mockResolvedValue(mockCto);
      (Olt.findOne as jest.Mock).mockResolvedValue(null);
      (respM as jest.Mock).mockReturnValue({ status: 404, message: "OLT not found" });

      const result = await clientService.create(mockClient);

      expect(Cto.findOne).toHaveBeenCalledWith({ where: { integrationId: mockClient.ctoIntegrationId } });
      expect(Olt.findOne).toHaveBeenCalledWith({ where: { integrationId: mockClient.oltIntegrationId } });
      expect(respM).toHaveBeenCalledWith(404, "OLT not found");
      expect(result).toEqual({ status: 404, message: "OLT not found" });
    });

    it("should handle unique constraint errors", async () => {
      const mockClient = { 
        integrationId: "1", ctoIntegrationId: "1", oltIntegrationId: "1",
        latitude: 0,
        longitude: 0,
        pppoeUsername: "",
        active: false
      };
      (schema.clientCreate.validate as jest.Mock).mockReturnValue({ error: null });
      (Client.create as jest.Mock).mockRejectedValue(new UniqueConstraintError({}));
      (respM as jest.Mock).mockReturnValue({ status: 409, message: "A client with the provided integration ID already exists." });
      const mockCto = { id: 1 };
      const mockOlt = { id: 1 };
      (Cto.findOne as jest.Mock).mockResolvedValue(mockCto);
      (Olt.findOne as jest.Mock).mockResolvedValue(mockOlt);

      const result = await clientService.create(mockClient);

      expect(respM).toHaveBeenCalledWith(409, "A client with the provided integration ID already exists.");
      expect(result).toEqual({ status: 409, message: "A client with the provided integration ID already exists." });
    });
  });

  describe("update", () => {
    it("should update a client successfully", async () => {
      const mockClient = { integrationId: "1"};
      const updatedClient = { ...mockClient, description: "Updated Client" };
      const mockCto = { id: 1 };
      const mockOlt = { id: 1 };
      const mockExistingClient = { 
        update: jest.fn().mockResolvedValue(updatedClient),
        integrationId: mockClient.integrationId
      };

      (schema.clientUpdate.validate as jest.Mock).mockReturnValue({ error: null });
      (Client.findOne as jest.Mock).mockResolvedValue(mockExistingClient);
      (Cto.findOne as jest.Mock).mockResolvedValue(mockCto);
      (Olt.findOne as jest.Mock).mockResolvedValue(mockOlt);
      (resp as jest.Mock).mockReturnValue({ status: 200, data: updatedClient });

      const result = await clientService.update(mockClient.integrationId, updatedClient);

      expect(Client.findOne).toHaveBeenCalledWith({ where: { integrationId: mockClient.integrationId } });
      expect(mockExistingClient.update).toHaveBeenCalledWith({
        ...updatedClient,
      });
      expect(result).toEqual({ status: 200, data: updatedClient });
    });

    it("should handle client not found error", async () => {
      const mockClient = { integrationId: "1", ctoIntegrationId: "1", oltIntegrationId: "1" };
      (schema.clientUpdate.validate as jest.Mock).mockReturnValue({ error: null });
      (Client.findOne as jest.Mock).mockResolvedValue(null);
      (respM as jest.Mock).mockReturnValue({ status: 404, message: "Client not found" });

      const result = await clientService.update(mockClient.integrationId, mockClient);

      expect(Client.findOne).toHaveBeenCalledWith({ where: { integrationId: mockClient.integrationId } });
      expect(respM).toHaveBeenCalledWith(404, "Client not found");
      expect(result).toEqual({ status: 404, message: "Client not found" });
    });

    it("should handle unique constraint errors on update", async () => {
      const mockClient = { integrationId: "1" };
      const updatedClient = { ...mockClient, description: "Updated Client", ctoIntegrationId: "1", oltIntegrationId: "1"};
      const mockExistingClient = { 
        update: jest.fn().mockRejectedValue(new UniqueConstraintError({})),
        integrationId: mockClient.integrationId
      };

      const mockCto = { id: 1 };
      const mockOlt = { id: 1 };

      (Cto.findOne as jest.Mock).mockResolvedValue(mockCto);
      (Olt.findOne as jest.Mock).mockResolvedValue(mockOlt);

      (schema.clientUpdate.validate as jest.Mock).mockReturnValue({ error: null });
      (Client.findOne as jest.Mock).mockResolvedValue(mockExistingClient);
      (respM as jest.Mock).mockReturnValue({ status: 409, message: "A client with the provided integration ID already exists." });

      const result = await clientService.update(mockClient.integrationId, updatedClient);

      expect(mockExistingClient.update).toHaveBeenCalledWith({ ...updatedClient, oltId: 1, ctoId: 1});
      expect(respM).toHaveBeenCalledWith(409, "A client with the provided integration ID already exists.");
      expect(result).toEqual({ status: 409, message: "A client with the provided integration ID already exists." });
    });
  });
});
