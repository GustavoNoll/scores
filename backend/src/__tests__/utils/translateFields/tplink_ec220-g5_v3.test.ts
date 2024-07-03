import path from "path";
import fs from 'fs';
import Device from "../../../database/models/device";
import translateModel from "../../../utils/translateModel";
import TplinkEC200_G5v3 from "../../../utils/dataModels/tplinkEC200-G5_v3";

describe('translateFields', () => { 

  it('should return the correct model for a matching device', () => {
    const device = Device.build({
      manufacturer: 'TP-Link',
      oui: '00259E',
      productClass: 'IGD',
      modelName: 'F670L',
      hardwareVersion: 'EC220-G5 v2 00000003',
      softwareVersion: '1.4',
    });

    const model = translateModel(device);
    expect(model).toBeInstanceOf(TplinkEC200_G5v3);
  });
  it('should translate fields from tplink model', () => {
    const model = new TplinkEC200_G5v3();
    const jsonContent = fs.readFileSync(path.join(__dirname, './informTests/tplink_ec220-g5_v3.json'), 'utf-8');

    // Convert the JSON content to a JavaScript object
    const data = JSON.parse(jsonContent);
    expect(model.translateFields(data)).toEqual({
      cpuUsage: 2,
      memoryUsage: 0.47,
      rxPower: 0,
      temperature: null,
      txPower: 0,
      uptime: 512397,
      voltage: null,
      wifiConnectedDevices: [
        {
          active: true,
          mac: "DA:92:AD:26:06:C2",
          rssi: -66,
          wifiIndex: 2,
          connection: "5G"
        },
        {
          active: true,
          mac: "8E:EC:81:56:66:62",
          rssi: -66,
          wifiIndex: 2,
          connection: "5G"
        },
        {
          active: true,
          mac: "FC:EE:E6:0C:E4:13",
          rssi: -28,
          wifiIndex: 1,
          connection: "2.4G"
        },
        {
          active: true,
          mac: "8A:E5:86:57:8E:1D",
          rssi: -54,
          wifiIndex: 1,
          connection: "2.4G"
        },
        {
          active: true,
          mac: "26:E3:AD:C1:24:1C",
          rssi: -47,
          wifiIndex: 2,
          connection: "5G"
        },
      ],
      wifiNetworks:  [
         {
           autoChannelEnabled: false,
           channel: 6,
           index: 1,
           rssiDevices:  [
            {
              mac: "8A:E5:86:57:8E:1D",
              rssi: -54,
            },
            {
              mac: "FC:EE:E6:0C:E4:13",
              rssi: -28,
            }
           ],
           ssid: 'semacesso',
           wifi_type: '2.4G',
         },
         {
           autoChannelEnabled: false,
           channel: 40,
           index: 2,
           rssiDevices:  [
            {
              mac: "8E:EC:81:56:66:62",
              rssi: -66,
            },
            {
              mac: "DA:92:AD:26:06:C2",
              rssi: -66,
            },
            {
              mac: "26:E3:AD:C1:24:1C",
              rssi: -47,
            }
           ],
           ssid: 'semacesso_5G',
           wifi_type: '5G',
         },
       ],

    });
  });
});