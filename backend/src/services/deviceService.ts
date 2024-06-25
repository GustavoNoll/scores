import { ModelStatic, UniqueConstraintError } from "sequelize";
import AcsInform from "../database/models/acsInform";
import Device from "../database/models/device";

class DeviceService {
  private model: ModelStatic<Device> = Device;

  async processAcsInform(acsInform: AcsInform) {
    try {
      let device = await this.model.findOne({ where: { deviceTag: acsInform.deviceTag } });

      if (!device) {
        device = await this.model.create({ deviceTag: acsInform.deviceTag });
        //UPDATE others attributes
      } else {
        console.log(`Dispositivo com device_tag ${acsInform.deviceTag} já existe.`);
        //UPDATE others attributes
      }
  
  
    } catch (error) {
      console.error(`Erro ao processar acsInform ${acsInform.id} no deviceService:`, error);
      throw error;
    }
  }
}
export default DeviceService