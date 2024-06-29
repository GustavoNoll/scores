// Import dependencies
import { UniqueConstraintError } from "sequelize";
import OltService from "../../services/oltService";
import Olt from "../../database/models/olt";
import schema from "../../services/validations/oltSchema";
import resp from "../../utils/resp";
import respM from "../../utils/respM";
import { OltUpdateInterface } from "../../interfaces/oltInterface";

// Mock dependencies
jest.mock("../../database/models/olt");
jest.mock("../../services/validations/oltSchema");
jest.mock("../../utils/resp");
jest.mock("../../utils/respM");

describe("OltService", () => {
  let oltService: OltService;

  beforeEach(() => {
    oltService = new OltService();
  });

  describe("get", () => {
    it("should return OLTS successfully", async () => {
      const mockOlts = [{ id: 1 }];
      (Olt.findAll as jest.Mock).mockResolvedValue(mockOlts);
      (resp as jest.Mock).mockReturnValue({ status: 200, data: mockOlts });

      const result = await oltService.get();

      expect(Olt.findAll).toHaveBeenCalledWith({ where: undefined });
      expect(resp).toHaveBeenCalledWith(200, mockOlts);
      expect(result).toEqual({ status: 200, data: mockOlts });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      (Olt.findAll as jest.Mock).mockRejectedValue(error);
      (resp as jest.Mock).mockReturnValue({ status: 500, message: "Error retrieving OLTS", error });

      const result = await oltService.get();

      expect(resp).toHaveBeenCalledWith(500, { message: "Error retrieving OLTS", error });
      expect(result).toEqual({ status: 500, message: "Error retrieving OLTS", error });
    });
  });

  describe("create", () => {
    it("should create an OLT successfully", async () => {
      const mockOlt = { integrationId: "1", description: "aa", latitude: 5, longitude: 5 };
      (schema.oltCreate.validate as jest.Mock).mockReturnValue({ error: null });
      (Olt.create as jest.Mock).mockResolvedValue(mockOlt);
      (resp as jest.Mock).mockReturnValue({ status: 201, data: mockOlt });

      const result = await oltService.create(mockOlt);

      expect(Olt.create).toHaveBeenCalledWith(mockOlt);
      expect(resp).toHaveBeenCalledWith(201, mockOlt);
      expect(result).toEqual({ status: 201, data: mockOlt });
    });

    it("should handle validation errors", async () => {
      const error = { message: "Validation error" };
      (schema.oltCreate.validate as jest.Mock).mockReturnValue({ error });
      (respM as jest.Mock).mockReturnValue({ status: 422, message: error.message });
    
      const result = await oltService.create({
        integrationId: "",
        description: "",
        latitude: -5,
        longitude: 0
      });
    
      expect(respM).toHaveBeenCalledWith(422, error.message);
      expect(result).toEqual({ status: 422, message: error.message });
    });

    it("should handle unique constraint errors", async () => {
      const mockOlt = { integrationId: "1", description: "", latitude: 0, longitude: 0 };
      (schema.oltCreate.validate as jest.Mock).mockReturnValue({ error: null });
      (Olt.create as jest.Mock).mockRejectedValue(new UniqueConstraintError({}));
      (respM as jest.Mock).mockReturnValue({ status: 409, message: "A olt with the provided integration ID already exists." });
    
      const result = await oltService.create(mockOlt);
    
      expect(respM).toHaveBeenCalledWith(409, "A olt with the provided integration ID already exists.");
      expect(result).toEqual({ status: 409, message: "A olt with the provided integration ID already exists." });
    });
  });

  describe("update", () => {
    it("should update an OLT successfully", async () => {
      const mockOlt = { integrationId: "1", description: "OLT1", latitude: 0, longitude: 0 };
      const updatedOlt = { ...mockOlt, description: "Updated OLT" };

      (schema.oltUpdate.validate as jest.Mock).mockReturnValue({ error: null });
      const mockUpdate = jest.fn().mockResolvedValue(updatedOlt);
      (Olt.findOne as jest.Mock).mockResolvedValue({ update: mockUpdate });
      (resp as jest.Mock).mockReturnValue({ status: 200, data: updatedOlt });

      const result = await oltService.update(mockOlt.integrationId, updatedOlt);

      expect(Olt.findOne).toHaveBeenCalledWith({ where: { integrationId: mockOlt.integrationId } });
      expect(mockUpdate).toHaveBeenCalledWith(updatedOlt);
      expect(result).toEqual({ status: 200, data: updatedOlt });
    });

    it("should handle OLT not found", async () => {
      (schema.oltUpdate.validate as jest.Mock).mockReturnValue({ error: null });
      (Olt.findOne as jest.Mock).mockResolvedValue(null);
      (respM as jest.Mock).mockReturnValue({ status: 404, message: "OLT not found" });
    
      const result = await oltService.update("1", { description: "", latitude: 0, longitude: 0 });
    
      expect(respM).toHaveBeenCalledWith(404, "OLT not found");
      expect(result).toEqual({ status: 404, message: "OLT not found" });
    });

    it("should handle unique constraint errors on update", async () => {
      const mockOlt = { integrationId: "2" };
      const updatedOlt = { description: "", latitude: 0, longitude: 0 };
      (schema.oltUpdate.validate as jest.Mock).mockReturnValue({ error: null });
      (Olt.findOne as jest.Mock).mockResolvedValue({ update: jest.fn().mockRejectedValue(new UniqueConstraintError({})) });
      (respM as jest.Mock).mockReturnValue({ status: 409, message: "An OLT with the provided integration ID already exists." });

      const result = await oltService.update(mockOlt.integrationId, updatedOlt);

      expect(respM).toHaveBeenCalledWith(409, "An OLT with the provided integration ID already exists.");
      expect(result).toEqual({ status: 409, message: "An OLT with the provided integration ID already exists." });
    });
  });
});
