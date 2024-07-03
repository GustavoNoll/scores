import path from "path";
import fs from 'fs';
import ZteF670LModel from "../../../utils/dataModels/zteF670Lv9";

describe('translateFields', () => { 
  it('should translate fields from huawei model', () => {
    const model = new ZteF670LModel();
    const jsonContent = fs.readFileSync(path.join(__dirname, './informTests/zte_f670l_v9.json'), 'utf-8');

    // Convert the JSON content to a JavaScript object
    const data = JSON.parse(jsonContent);
    expect(model.translateFields(data)).toEqual({
      cpuUsage: 0.07,
      memoryUsage: 0.63,
      rxPower: -18.12,
      temperature: 49.71,
      txPower: 2.35,
      uptime: 28792,
      voltage: null,
      wifiConnectedDevices: [
        {
          active: true,
          mac: "3C:9C:0F:71:9E:8B",
          rssi: -24,
          wifiIndex: 1,
          connection: '2.4G'
        },
        {
          active: true,
          mac: "4C:53:FD:C0:2B:19",
          rssi: -8,
          wifiIndex: 5,
          connection: '5G'
        },
        {
          active: true,
          mac: "90:CC:DF:C0:CB:46",
          rssi: -31,
          wifiIndex: 5,
          connection: "5G"
        },
        {
          active: true,
          mac: "2E:EE:40:36:88:FF",
          rssi: -38,
          wifiIndex: 1,
          connection: "2.4G"
        },
        {
          active: true,
          mac: "E6:D0:18:E4:20:8F",
          rssi: -51,
          wifiIndex: 5,
          connection: "5G"
        },
        {
          active: true,
          mac: "AC:5A:F0:8A:21:66",
          rssi: -55,
          wifiIndex: 5,
          connection: "5G"
        },
        {
          active: true,
          mac: "84:E6:57:78:D6:EE",
          rssi: -51,
          wifiIndex: 5,
          connection: "5G"
        },
        {
          active: true,
          mac: "E8:40:F2:3A:1E:DF",
          rssi: null,
          wifiIndex: null,
          connection: "ethernet"
        },
        
        
      ],
      wifiNetworks:  [
         {
           autoChannelEnabled: null,
           channel: 11,
           index: 1,
           rssiDevices:  [
            {
              mac: "3C:9C:0F:71:9E:8B",
              rssi: -24,
            },
            {
              mac: "2E:EE:40:36:88:FF",
              rssi: -38
            }
           ],
           ssid: 'MANIKOMIO',
           wifi_type: '2.4G',
         },
         {
           autoChannelEnabled: true,
           channel: 112,
           index: 5,
           rssiDevices:  [
            {
              mac: "4C:53:FD:C0:2B:19",
              rssi: -8
            },
            {
              mac: "90:CC:DF:C0:CB:46",
              rssi: -31,
            },
            {
              mac: "E6:D0:18:E4:20:8F",
              rssi: -51,
            },
            {
              mac: "AC:5A:F0:8A:21:66",
              rssi: -55,
            },
            {
              mac: "84:E6:57:78:D6:EE",
              rssi: -51,
            }
           ],
           ssid: 'MANIKOMIO_5G',
           wifi_type: '5G',
         },
       ],

    });
  });
});