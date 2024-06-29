// Import dependencies
import { UniqueConstraintError } from "sequelize";
import AcsInformService from "../../services/acsInformService";
import AcsInform from "../../database/models/acsInform";
import schema from "../../services/validations/schema";
import resp from "../../utils/resp";
import respM from "../../utils/respM";

// Mock dependencies
jest.mock("../../database/models/acsInform");
jest.mock("../../services/validations/schema");
jest.mock("../../utils/resp");
jest.mock("../../utils/respM");

describe("AcsInformService", () => {
  let acsInformService: AcsInformService;

  beforeEach(() => {
    acsInformService = new AcsInformService();
  });

  describe("get", () => {
    it("should return acs informs successfully", async () => {
      const mockAcsInforms = [{ id: 1 }];
      (AcsInform.findAll as jest.Mock).mockResolvedValue(mockAcsInforms);
      (resp as jest.Mock).mockReturnValue({ status: 200, data: mockAcsInforms });

      const result = await acsInformService.get();

      expect(AcsInform.findAll).toHaveBeenCalledWith({ where: undefined });
      expect(resp).toHaveBeenCalledWith(200, mockAcsInforms);
      expect(result).toEqual({ status: 200, data: mockAcsInforms });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      (AcsInform.findAll as jest.Mock).mockRejectedValue(error);
      (resp as jest.Mock).mockReturnValue({ status: 500, message: "Error retrieving AcsInforms", error });

      const result = await acsInformService.get();

      expect(resp).toHaveBeenCalledWith(500, { message: "Error retrieving AcsInforms", error });
      expect(result).toEqual({ status: 500, message: "Error retrieving AcsInforms", error });
    });
  });

  describe("create", () => {
    it("should create an acs informs successfully", async () => {
      const mockAcsInform = { deviceTag: "aaa", jsonData: {"aa": 123} };
      (schema.acsInform.validate as jest.Mock).mockReturnValue({ error: null });
      (AcsInform.create as jest.Mock).mockResolvedValue(mockAcsInform);
      (resp as jest.Mock).mockReturnValue({ status: 201, data: mockAcsInform });
    
      const result = await acsInformService.create(mockAcsInform);
    
      expect(AcsInform.create).toHaveBeenCalledWith(mockAcsInform);
      expect(resp).toHaveBeenCalledWith(201, mockAcsInform);
      expect(result).toEqual({ status: 201, data: mockAcsInform });
    });

    it("should handle validation errors", async () => {
      const error = { message: "Validation error" };
      (schema.acsInform.validate as jest.Mock).mockReturnValue({ error });
      (respM as jest.Mock).mockReturnValue({ status: 422, message: error.message });
    
      const result = await acsInformService.create({ deviceTag: "aaa", jsonData: {"aa": 123} });
    
      expect(respM).toHaveBeenCalledWith(422, error.message);
      expect(result).toEqual({ status: 422, message: error.message });
    });
  });
});
