import { ModelStatic } from "sequelize";
import FieldMeasure from "../database/models/fieldMeasure";
import { ConnectedDevices, TranslateFields, WifiNetworks } from "../utils/dataModelTypes";
import Device from "../database/models/device";

const NUM_WORST_RSSI_VALUES = 3;

class FieldMeasureService {
  private model: ModelStatic<FieldMeasure> = FieldMeasure;

  private createGeneralFieldMeasures(device: Device, translateFields: TranslateFields) {
    return Object.entries(translateFields)
      .filter(([field]) => field !== "connectedDevices" && field !== "wifiNetworks")
      .map(([field, value]) => {
        if ((field === "cpuUsage" || field === "memoryUsage") && typeof value === "number" && (value < 0 || value > 1)) {
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
    let autoChannel2G: number | null = null;
    let autoChannel5G: number | null = null;
    let rssiValues: number[] = [];

    wifiNetworks.forEach(network => {
      const { wifi_type, autoChannelEnabled, rssiDevices } = network;


      if (wifi_type === '2.4G') {
        connectedDevices2G += rssiDevices.length;
        autoChannel2G = autoChannelEnabled ? 1 : 0;
      } else if (wifi_type === '5G') {
        connectedDevices5G += rssiDevices.length;
        autoChannel5G = autoChannelEnabled ? 1 : 0;
      }

      rssiDevices.forEach(device => {
        if (device.rssi !== null) {
          rssiValues.push(device.rssi);
        }
      });
    });

    rssiValues.sort((a, b) => a - b);
    const worstRssiValues = rssiValues.length >= NUM_WORST_RSSI_VALUES ? rssiValues.slice(0, NUM_WORST_RSSI_VALUES) : rssiValues;
    const averageWorstRssi = worstRssiValues.length ? (worstRssiValues.reduce((sum, value) => sum + value, 0) / worstRssiValues.length) : null;

    return [
      {
        clientId: device.clientId,
        deviceId: device.id,
        field: 'totalConnectedDevices',
        value: totalConnectedDevices,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        clientId: device.clientId,
        deviceId: device.id,
        field: 'connectedDevices2G',
        value: connectedDevices2G,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        clientId: device.clientId,
        deviceId: device.id,
        field: 'connectedDevices5G',
        value: connectedDevices5G,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        clientId: device.clientId,
        deviceId: device.id,
        field: 'autoChannel2G',
        value: autoChannel2G,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        clientId: device.clientId,
        deviceId: device.id,
        field: 'autoChannel5G',
        value: autoChannel5G,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        clientId: device.clientId,
        deviceId: device.id,
        field: 'averageWorstRssi',
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
}

export default FieldMeasureService;
