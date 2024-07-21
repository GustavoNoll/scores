import { ModelStatic } from "sequelize";
import AcsInform from "../database/models/acsInform";
import resp from "../utils/resp";
import schema from "./validations/schema";
import respM from "../utils/respM";
import AcsInformInterface from "../interfaces/acsInformInterface";
import DeviceService from "./deviceService";
import Device from "../database/models/device";
import FieldMeasureService from "./fieldMeasureService";

class AcsInformService {
  private model: ModelStatic<AcsInform> = AcsInform;

  async get(acsInform?: any) {
    try {
      const acsInforms = await this.model.findAll({
        where: acsInform,
      });
      return resp(200, acsInforms);
    } catch (error) {
      // Lide com erros conforme necessário
      return resp(500, { message: 'Error retrieving AcsInforms', error });
    }
  }

  async create(acsInform: AcsInformInterface) {
    const { error } = schema.acsInform.validate(acsInform)
    if (error) return resp(422, error.message);
    const created = await this.model.create({ ...acsInform })
    return resp(201, created)
  }

  async processAcsInform(acsInform: AcsInform) {
    try {
      const deviceService = new DeviceService()
      const fieldMeasureService = new FieldMeasureService()
      let device = await Device.findOne({ where: { deviceTag: acsInform.deviceTag } });
      if (!device) {
        device = await deviceService.createDeviceByAcsInform(acsInform)
      } else {
        await deviceService.updateDevice(device, acsInform.jsonData);
      }

      if (device === null) {
        console.log('Falha ao criar dispositivo')
        return
      }

      if (device.clientId !== null) {
        const response = await fieldMeasureService.processFields(device, acsInform);
        if (!response){
          return
        }
      }else{
        console.log("Device unlinked")
      }

      await acsInform.destroy();
    } catch (error) {
      console.error(`Error processing acsInform ${acsInform.id} in DeviceService:`, error);
      throw error;
    }
  }
}
export default AcsInformService