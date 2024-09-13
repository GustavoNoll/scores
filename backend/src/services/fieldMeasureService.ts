import { ModelStatic, Op } from "sequelize";
import FieldMeasure from "../database/models/fieldMeasure";
import { ConnectedDevices, TranslateFields, WifiNetworks } from "../utils/dataModelTypes";
import Device from "../database/models/device";
import AcsInform from "../database/models/acsInform";
import translateModel from "../utils/translateModel";
import { FIELD_CONNECTED_DEVICES_5G_RATIO, FIELD_AVERAGE_WORST_RSSI, FIELD_CPU_USAGE, FIELD_MEMORY_USAGE, FIELD_TOTAL_CONNECTED_DEVICES } from "../constants/fieldConstants";
import { FieldMeasuresGrouped } from "../interfaces/fieldMeasureInterface";

const NUM_WORST_RSSI_VALUES = 3;

class FieldMeasureService {
  private model: ModelStatic<FieldMeasure> = FieldMeasure;


  async processFields(device: Device, acsInform: AcsInform) : Promise<boolean> {
    try {
      const modelInstance = translateModel(device);
      if (modelInstance) {
        const fields = modelInstance.translateFields(acsInform.jsonData);
        await this.generateFieldMeasures(device, fields);
      } else {
        console.log('No corresponding model found for the device.');
      }
      return true;
    } catch (error) {
      console.error(`Error processing fields for device ${device.id} in DeviceService:`, error);
      return false;
    }
  }
  private createGeneralFieldMeasures(device: Device, translateFields: TranslateFields) {
    return Object.entries(translateFields)
      .filter(([field]) => field !== "connectedDevices" && field !== "wifiNetworks")
      .map(([field, value]) => {
        if ((field === FIELD_CPU_USAGE || field === FIELD_MEMORY_USAGE) && typeof value === "number" && (value < 0 || value > 1)) {
          value = null;
        }

        return {
          clientId: device.clientId,
          deviceId: device.id,
          field,
          value,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      });
  }

  private createWifiFieldMeasures(device: Device, wifiNetworks: WifiNetworks, connectedDevices: ConnectedDevices) {
    let totalConnectedDevices = connectedDevices.length;
    let connectedDevices2G = 0;
    let connectedDevices5G = 0;
    let rssiValues: number[] = [];

    wifiNetworks.forEach(network => {
      const { wifi_type, rssiDevices } = network;


      if (wifi_type === '2.4G') {
        connectedDevices2G += rssiDevices.length;
      } else if (wifi_type === '5G') {
        connectedDevices5G += rssiDevices.length;
      }

      rssiDevices.forEach(device => {
        if (device.rssi !== null) {
          rssiValues.push(device.rssi);
        }
      });
    });

    let connectedDevices5GRatio: number | null = null;

    if (connectedDevices5G > 0 || connectedDevices2G > 0) {
      connectedDevices5GRatio = connectedDevices5G / (connectedDevices2G + connectedDevices5G);
    }

    rssiValues.sort((a, b) => a - b);
    const worstRssiValues = rssiValues.length >= NUM_WORST_RSSI_VALUES ? rssiValues.slice(0, NUM_WORST_RSSI_VALUES) : rssiValues;
    const averageWorstRssi = worstRssiValues.length ? (worstRssiValues.reduce((sum, value) => sum + value, 0) / worstRssiValues.length) : null;

    return [
      {
        clientId: device.clientId,
        deviceId: device.id,
        field: FIELD_TOTAL_CONNECTED_DEVICES,
        value: totalConnectedDevices,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        clientId: device.clientId,
        deviceId: device.id,
        field: FIELD_CONNECTED_DEVICES_5G_RATIO,
        value: connectedDevices5GRatio,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        clientId: device.clientId,
        deviceId: device.id,
        field: FIELD_AVERAGE_WORST_RSSI,
        value: averageWorstRssi,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
  }

  async generateFieldMeasures(device: Device, translatedFields: TranslateFields) {
    const generalFieldMeasures = this.createGeneralFieldMeasures(device, translatedFields);
    const wifiFieldMeasures = this.createWifiFieldMeasures(device, translatedFields.wifiNetworks, translatedFields.connectedDevices);

    const fieldMeasures = [...generalFieldMeasures, ...wifiFieldMeasures];

    return await this.model.bulkCreate(fieldMeasures);
  }

  async getFieldMeasuresLast7Days(device: Device): Promise<FieldMeasuresGrouped> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const fieldMeasures = await FieldMeasure.findAll({
      where: {
        deviceId: device.id,
        clientId: device.clientId,
        field: {
          [Op.ne]: 'general'
        },
        createdAt: {
          [Op.gte]: sevenDaysAgo
        }
      },
      attributes: ['field', 'value', 'createdAt'],
      order: [['field', 'ASC'], ['createdAt', 'DESC']]
    });

    const groupedMeasures: { [key: string]: { value: number; createdAt: Date }[] } = {};

    fieldMeasures.forEach(measure => {
      const field = measure.field;

      if (!groupedMeasures[field]) {
        groupedMeasures[field] = [];
      }

      groupedMeasures[field].push({
        value: measure.value,
        createdAt: measure.createdAt,
      });
    });

    return groupedMeasures;
  }

}

export default FieldMeasureService;
