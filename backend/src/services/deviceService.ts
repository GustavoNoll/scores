import { ModelStatic, Op } from "sequelize";
import AcsInform from "../database/models/acsInform";
import Device from "../database/models/device";
import DataModel from "../utils/dataModel";
import translateModel from "../utils/translateModel";
import FieldMeasureService from "./fieldMeasureService";
import Client from "../database/models/client";

class DeviceService {
  private model: ModelStatic<Device> = Device;
  
  async createDeviceByAcsInform(acsInform: AcsInform) {
    const baseDevice = DataModel.getBaseDevice(acsInform.jsonData);
    if (!this.minDataToCreateDevice(baseDevice)) {
      console.log('Failed to retrieve minimal device information.');
      return null;
    }
    return await this.createDevice(baseDevice, acsInform.deviceTag);
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

  async updateDevice(device: Device, updatedData: any) {
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
