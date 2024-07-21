// Import dependencies
import { UniqueConstraintError } from "sequelize";
import CtoService from "../../services/ctoService";
import Cto from "../../database/models/cto";
import schema from "../../services/validations/ctoSchema";
import resp from "../../utils/resp";
import respM from "../../utils/respM";

// Mock dependencies
jest.mock("../../database/models/cto");
jest.mock("../../services/validations/ctoSchema");
jest.mock("../../utils/resp");
jest.mock("../../utils/respM");

describe("CtoService", () => {
  let ctoService: CtoService;

  beforeEach(() => {
    ctoService = new CtoService();
  });

  describe("get", () => {
    it("should return CTOS successfully", async () => {
      const mockCtos = [{ id: 1 }];
      (Cto.findAll as jest.Mock).mockResolvedValue(mockCtos);
      (resp as jest.Mock).mockReturnValue({ status: 200, data: mockCtos });

      const result = await ctoService.get();

      expect(Cto.findAll).toHaveBeenCalledWith({ where: undefined });
      expect(resp).toHaveBeenCalledWith(200, mockCtos);
      expect(result).toEqual({ status: 200, data: mockCtos });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      (Cto.findAll as jest.Mock).mockRejectedValue(error);
      (resp as jest.Mock).mockReturnValue({ status: 500, message: "Error retrieving Ctos", error });

      const result = await ctoService.get();

      expect(resp).toHaveBeenCalledWith(500, { message: "Error retrieving Ctos", error });
      expect(result).toEqual({ status: 500, message: "Error retrieving Ctos", error });
    });
  });

  describe("create", () => {
    it("should create an CTO successfully", async () => {
      const mockCto = { integrationId: "1", description: "aa", latitude: 5, longitude: 5 };
      (schema.create.validate as jest.Mock).mockReturnValue({ error: null });
      (Cto.create as jest.Mock).mockResolvedValue(mockCto);
      (resp as jest.Mock).mockReturnValue({ status: 201, data: mockCto });

      const result = await ctoService.create(mockCto);

      expect(Cto.create).toHaveBeenCalledWith(mockCto);
      expect(resp).toHaveBeenCalledWith(201, mockCto);
      expect(result).toEqual({ status: 201, data: mockCto });
    });

    it("should handle validation errors", async () => {
      const error = { message: "Validation error" };
      (schema.create.validate as jest.Mock).mockReturnValue({ error });
      (respM as jest.Mock).mockReturnValue({ status: 422, message: error.message });
    
      const result = await ctoService.create({
        integrationId: "",
        description: "",
        latitude: -5,
        longitude: 0
      });
    
      expect(respM).toHaveBeenCalledWith(422, error.message);
      expect(result).toEqual({ status: 422, message: error.message });
    });

    it("should handle unique constraint errors", async () => {
      const mockCto = { integrationId: "1", description: "", latitude: 0, longitude: 0 };
      (schema.create.validate as jest.Mock).mockReturnValue({ error: null });
      (Cto.create as jest.Mock).mockRejectedValue(new UniqueConstraintError({}));
      (respM as jest.Mock).mockReturnValue({ status: 409, message: "A cto with the provided integration ID already exists." });
    
      const result = await ctoService.create(mockCto);
    
      expect(respM).toHaveBeenCalledWith(409, "A cto with the provided integration ID already exists.");
      expect(result).toEqual({ status: 409, message: "A cto with the provided integration ID already exists." });
    });
  });

  describe("update", () => {
    it("should update an CTO successfully", async () => {
      const mockCto = { integrationId: "1", description: "CTO1", latitude: 0, longitude: 0 };
      const updatedCto = { ...mockCto, description: "Updated CTO" };

      (schema.update.validate as jest.Mock).mockReturnValue({ error: null });
      const mockUpdate = jest.fn().mockResolvedValue(updatedCto);
      (Cto.findOne as jest.Mock).mockResolvedValue({ update: mockUpdate });
      (resp as jest.Mock).mockReturnValue({ status: 200, data: updatedCto });

      const result = await ctoService.update(mockCto.integrationId, updatedCto);

      expect(Cto.findOne).toHaveBeenCalledWith({ where: { integrationId: mockCto.integrationId } });
      expect(mockUpdate).toHaveBeenCalledWith(updatedCto);
      expect(result).toEqual({ status: 200, data: updatedCto });
    });

    it("should handle CTO not found", async () => {
      (schema.update.validate as jest.Mock).mockReturnValue({ error: null });
      (Cto.findOne as jest.Mock).mockResolvedValue(null);
      (respM as jest.Mock).mockReturnValue({ status: 404, message: "CTO not found" });
    
      const result = await ctoService.update("1", { description: "", latitude: 0, longitude: 0 });
    
      expect(respM).toHaveBeenCalledWith(404, "CTO not found");
      expect(result).toEqual({ status: 404, message: "CTO not found" });
    });

    it("should handle unique constraint errors on update", async () => {
      const mockCto = { integrationId: "2" };
      const updatedCto = { description: "", latitude: 0, longitude: 0 };
      (schema.update.validate as jest.Mock).mockReturnValue({ error: null });
      (Cto.findOne as jest.Mock).mockResolvedValue({ update: jest.fn().mockRejectedValue(new UniqueConstraintError({})) });
      (respM as jest.Mock).mockReturnValue({ status: 409, message: "A cto with the provided integration ID already exists." });

      const result = await ctoService.update(mockCto.integrationId, updatedCto);

      expect(respM).toHaveBeenCalledWith(409, "A cto with the provided integration ID already exists.");
      expect(result).toEqual({ status: 409, message: "A cto with the provided integration ID already exists." });
    });
  });
});
