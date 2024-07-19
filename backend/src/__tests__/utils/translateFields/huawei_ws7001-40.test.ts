import path from "path";
import HuaweiWS7001_40Model from '../../../utils/dataModels/huaweiWS7001-40';
import fs from 'fs';

describe('translateFields', () => { 
  it('should translate fields from huawei model', () => {
    const model = new HuaweiWS7001_40Model();
    const jsonContent = fs.readFileSync(path.join(__dirname, './informTests/huawei_WS7001-40.json'), 'utf-8');

    // Convert the JSON content to a JavaScript object
    const data = JSON.parse(jsonContent);
    expect(model.translateFields(data)).toEqual({
      cpuUsage: null,
      memoryUsage: null,
      rxPower: null,
      temperature: null,
      txPower: null,
      uptime: 10546,
      voltage: null,
      connectedDevices: [
        {
          active: true,
          mac: "B0:47:BF:BA:FF:D3",
          rssi: -74,
          wifiIndex: 1,
          connection: "2.4G"
        },
        {
          active: true,
          mac: "7C:1C:68:43:EA:4A",
          rssi: -54,
          wifiIndex: 1,
          connection: "2.4G"
        },
      ],
      wifiNetworks:  [
         {
           autoChannelEnabled: true,
           channel: 6,
           index: 1,
           rssiDevices:  [
              {
               mac: '7C:1C:68:43:EA:4A',
               rssi: -54,
             },
              {
               mac: 'B0:47:BF:BA:FF:D3',
               rssi: -74,
             },
           ],
           ssid: 'NEO_ELVIO',
           wifi_type: '2.4G',
         },
         {
           autoChannelEnabled: true,
           channel: 149,
           index: 2,
           rssiDevices:  [],
           ssid: 'NEO_ELVIO_5G',
           wifi_type: '5G',
         },
       ],

    });
  });
});