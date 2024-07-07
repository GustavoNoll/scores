import { ModelStatic, UniqueConstraintError } from "sequelize";
import AcsInform from "../database/models/acsInform";
import Device from "../database/models/device";
import DataModel from "../utils/dataModel";
import translateModel from "../utils/translateModel";
import FieldMeasureService from "./fieldMeasureService";

class DeviceService {
  private model: ModelStatic<Device> = Device;

  async processAcsInform(acsInform: AcsInform) {
    try {
      let device = await this.model.findOne({ where: { deviceTag: acsInform.deviceTag } });

      if (!device) {
        const baseDevice = DataModel.getBaseDevice(acsInform.jsonData)
        if (!(this.minDataToCreateDevice(baseDevice))){
          console.log('Falha ao pegar informações minimas do dispositivo');
        }
        device = await this.model.create({ ...baseDevice, deviceTag: acsInform.deviceTag });

        const modelInstance = translateModel(device);
        if (modelInstance) {
          await this.processFields(modelInstance, acsInform)
        } else {
          console.log('Nenhum modelo correspondente encontrado para o dispositivo.');
          return
        }
      } else {
        const modelInstance = translateModel(device);
        if (modelInstance) {
          await this.processFields(modelInstance, acsInform)
        } else {
          console.log('Nenhum modelo correspondente encontrado para o dispositivo.');
          return
        }
      }
  
      acsInform.destroy();
    } catch (error) {
      console.error(`Erro ao processar acsInform ${acsInform.id} no deviceService:`, error);
    }
  }

  async processFields(translateModel: DataModel, acsInform: AcsInform){
    const fieldMeasureService = new FieldMeasureService()
    const fields = translateModel.translateFields(acsInform.jsonData)
    await fieldMeasureService.generateFieldMeasures(fields)
  }

  minDataToCreateDevice(baseDevice: any): boolean {
    const mandatoryFields = ['manufacturer', 'oui', 'productClass', 'modelName', 'hardwareVersion', 'softwareVersion'];
    const areMandatoryFieldsValid = mandatoryFields.every(field => baseDevice[field] !== null && baseDevice[field] !== undefined);

    const optionalFields = ['pppoeUsername', 'mac', 'serialNumber'];
    const isAtLeastOneOptionalFieldValid = optionalFields.some(field => baseDevice[field] !== null && baseDevice[field] !== undefined);

    if (!(areMandatoryFieldsValid && isAtLeastOneOptionalFieldValid)) {
      return false
    }
    return true
  }
}
export default DeviceService