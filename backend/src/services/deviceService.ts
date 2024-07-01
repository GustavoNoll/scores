import { ModelStatic, UniqueConstraintError } from "sequelize";
import AcsInform from "../database/models/acsInform";
import Device from "../database/models/device";
import DataModel from "../utils/dataModel";
import translateModel from "../utils/translateModel";

class DeviceService {
  private model: ModelStatic<Device> = Device;

  async processAcsInform(acsInform: AcsInform) {
    try {
      let device = await this.model.findOne({ where: { deviceTag: acsInform.deviceTag } });

      if (!device) {
        const baseDevice = DataModel.getBaseDevice(acsInform.jsonData)
        device = await this.model.create({ ...baseDevice, deviceTag: acsInform.deviceTag });
        //UPDATE fields attributes
        const modelInstance = translateModel(device);
        if (modelInstance) {
          const fields = modelInstance.translateFields(acsInform.jsonData)
        } else {
          console.log('Nenhum modelo correspondente encontrado para o dispositivo.');
        }
      } else {
        const modelInstance = translateModel(device);
        if (modelInstance) {
          const fields = modelInstance.translateFields(acsInform.jsonData)
        } else {
          console.log('Nenhum modelo correspondente encontrado para o dispositivo.');
        }
      }
  
      //acsInform.destroy();
    } catch (error) {
      console.error(`Erro ao processar acsInform ${acsInform.id} no deviceService:`, error);
    }
  }
}
export default DeviceService