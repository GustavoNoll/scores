import { ModelStatic, Op } from "sequelize";
import AcsInform from "../database/models/acsInform";
import Device from "../database/models/device";
import DataModel from "../utils/dataModel";
import translateModel from "../utils/translateModel";
import FieldMeasureService from "./fieldMeasureService";
import Client from "../database/models/client";

class DeviceService {
  private model: ModelStatic<Device> = Device;

  // 1. create devices/updates by tag
  // 2. link device to client
  // 3. Generate fields measures
  async processAcsInform(acsInform: AcsInform) {
    try {
      let device = await this.model.findOne({ where: { deviceTag: acsInform.deviceTag } });
      if (!device) {
        const baseDevice = DataModel.getBaseDevice(acsInform.jsonData);

        if (!this.minDataToCreateDevice(baseDevice)) {
          console.log('Failed to retrieve minimal device information.');
          return;
        }

        device = await this.createDevice(baseDevice, acsInform.deviceTag);
      } else {
        await this.updateDevice(device, acsInform.jsonData);
      }

      if (device.clientId !== null) {
        const modelInstance = translateModel(device);
        if (modelInstance) {
          await this.processFields(device, modelInstance, acsInform);
        } else {
          console.log('No corresponding model found for the device.');
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

  private async linkDeviceToClient(device: Device) {
    const { mac, pppoeUsername, serialNumber } = device;
    const client = await this.findClientByAttributes({ mac, pppoeUsername, serialNumber });

    if (client) {
      device.clientId = client.id;
      await device.save();
    }
  }

  private async findClientByAttributes(attributes: { mac?: string, pppoeUsername?: string, serialNumber?: string }) {
    const { mac, pppoeUsername, serialNumber } = attributes;
    return await Client.findOne({
      where: {
        [Op.or]: [
          { pppoeUsername },
          { serialNumber },
          { mac }
        ].filter(condition => !!condition)
      }
    });
  }

  private async createDevice(baseDevice: any, deviceTag: string) {
    const device = await this.model.create({ ...baseDevice, deviceTag });
    await this.linkDeviceToClient(device);
    return device;
  }

  private async updateDevice(device: Device, updatedData: any) {
    const baseDevice = DataModel.getBaseDevice(updatedData);
    await device.update({ ...baseDevice });
    await this.linkDeviceToClient(device);
  }

  private async processFields(device: Device, translateModel: DataModel, acsInform: AcsInform) {
    try {
      const fieldMeasureService = new FieldMeasureService();
      const fields = translateModel.translateFields(acsInform.jsonData);
      await fieldMeasureService.generateFieldMeasures(device, fields);
    } catch (error) {
      console.error(`Error processing fields for device ${device.id} in DeviceService:`, error);
      throw error;
    }
  }

  private minDataToCreateDevice(baseDevice: any): boolean {
    const mandatoryFields = ['manufacturer', 'oui', 'productClass', 'modelName', 'hardwareVersion', 'softwareVersion'];
    const areMandatoryFieldsValid = mandatoryFields.every(field => baseDevice[field] !== null && baseDevice[field] !== undefined);

    const optionalFields = ['pppoeUsername', 'mac', 'serialNumber'];
    const isAtLeastOneOptionalFieldValid = optionalFields.some(field => baseDevice[field] !== null && baseDevice[field] !== undefined);

    return areMandatoryFieldsValid && isAtLeastOneOptionalFieldValid;
  }
}

export default DeviceService;
