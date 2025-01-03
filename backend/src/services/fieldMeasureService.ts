import { ModelStatic, Op } from "sequelize";
import FieldMeasure from "../database/models/fieldMeasure";
import { ConnectedDevices, TranslateFields, WifiNetworks } from "../utils/dataModelTypes";
import Device from "../database/models/device";
import AcsInform from "../database/models/acsInform";
import translateModel from "../utils/translateModel";
import { FIELD_CONNECTED_DEVICES_5G_RATIO, FIELD_AVERAGE_WORST_RSSI, FIELD_CPU_USAGE, FIELD_MEMORY_USAGE, FIELD_TOTAL_CONNECTED_DEVICES, FIELD_REBOOT_COUNT } from "../constants/fieldConstants";
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
  private async createGeneralFieldMeasures(device: Device, translateFields: TranslateFields) {
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

  private async createWifiFieldMeasures(device: Device, wifiNetworks: WifiNetworks, connectedDevices: ConnectedDevices) {
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
    const [generalFieldMeasures, wifiFieldMeasures, comparisonFieldMeasures] = await Promise.all([
      this.createGeneralFieldMeasures(device, translatedFields),
      this.createWifiFieldMeasures(device, translatedFields.wifiNetworks, translatedFields.connectedDevices),
      this.calculateComparisonFields(device, translatedFields)
    ]);
    const fieldMeasures = [...generalFieldMeasures, ...wifiFieldMeasures, ...comparisonFieldMeasures];
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

  private async calculateComparisonFields(device: Device, translatedFields: TranslateFields): Promise<Array<{clientId: number, deviceId: number, field: string, value: number, createdAt: Date, updatedAt: Date}>> {
    const comparisonFields = [];

    // Calculate reboot count
    const currentUptime = translatedFields.uptime;
    const lastUptime = await this.getLastUptime(device.id);
    if (lastUptime !== null && currentUptime !== null) {
      const rebootCount = currentUptime < lastUptime ? 1 : 0;

      comparisonFields.push({
        clientId: device.clientId,
        deviceId: device.id,
        field: FIELD_REBOOT_COUNT,
        value: rebootCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Add more comparison fields here if needed in the future
    // Example:
    // const someOtherField = calculateSomeOtherField(translatedFields);
    // if (someOtherField !== null) {
    //   comparisonFields.push({
    //     clientId: device.clientId,
    //     deviceId: device.id,
    //     field: FIELD_SOME_OTHER_FIELD,
    //     value: someOtherField,
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    //   });
    // }

    return comparisonFields;
  }

  private async getLastUptime(deviceId: number): Promise<number | null> {
    const lastUptimeMeasure = await this.model.findOne({
      where: { deviceId, field: 'uptime' },
      order: [['createdAt', 'DESC']],
    });
    return lastUptimeMeasure ? lastUptimeMeasure.value : null;
  }
}

export default FieldMeasureService;
