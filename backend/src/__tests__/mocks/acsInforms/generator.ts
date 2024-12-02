import path from "path";
import fs from 'fs';

export const generateMockZteInform = () => {
  
  const timestamp = new Date().toISOString();
  const serialNumber = `ZTELQJNN${Math.floor(Math.random() * 10000000)}`;
  
  // Create a deep clone of the template
  const jsonModel = fs.readFileSync(path.join(__dirname, './zte_f670l_v9.json'), 'utf-8');
  const inform = JSON.parse(jsonModel);
  
  // Update dynamic fields
  inform["_id"] = `042084-F670L-${serialNumber}`;
  inform["_deviceId"]["_SerialNumber"] = serialNumber;
  inform["_lastInform"] = timestamp;
  inform["_registered"] = timestamp;
  inform["_lastBoot"] = timestamp;
  inform["_webhookTimestamp"] = timestamp;

  // Update timestamps in the inform structure
  const updateTimestamps = (obj: any) => {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (obj[key]._timestamp) {
          obj[key]._timestamp = timestamp;
        }
        updateTimestamps(obj[key]);
      }
    }
  };

  updateTimestamps(inform.InternetGatewayDevice);
  return { deviceTag: inform["_id"], jsonData: JSON.stringify(inform) };
}; 