import { WifiNetworks } from "./dataModelTypes";

export function standardizeMac(mac: string): string | null {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

  if (!macRegex.test(mac)) return null;

  return mac.toUpperCase().replace(/[:-]/g, ':');
}
export function serialNumberShortForm(serialNumber: string): string | null {
  if (!serialNumber) return null;
  if (serialNumber.length === 12) return serialNumber.toUpperCase();

  if (/0000\w{8}0000/.test(serialNumber)) {
    return serialNumber.slice(4, -4).toUpperCase();
  }

  const upcaseSerialNumber = serialNumber.toUpperCase();
  const serialNumberPrefix = Buffer.from(upcaseSerialNumber.slice(0, 8), 'hex').toString();
  const serialNumberShortForm = (serialNumberPrefix + upcaseSerialNumber.slice(8, 16)).replace(/\x00/g, '');
  
  return serialNumberShortForm;
}

export function deepFind(obj: any, keys: string[]): any {
  for (const key of keys) {
    if (typeof obj !== 'object' || obj === null) return null;

    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = deepFind(item, keys);
        if (result !== null) return result;
      }
      return null;
    } else {
      obj = obj[key];
      keys = keys.slice(1)
    }
  }
  return obj || null;
}

export function rssiStringTonNumber(rssi: string | number): number {
  if (typeof rssi === 'number') return rssi 
  const numericPart = rssi.replace('dBm', '');
  
  // Convert the remaining string to a number
  const rssiNumber = parseInt(numericPart, 10);
  
  return rssiNumber;
}

export function findWifiNetworkByMac(wifiNetworks: WifiNetworks, mac: string): { index: number, connection: string, rssi: number | null } | undefined {
  for (const network of wifiNetworks) {
    for (const device of network.rssiDevices) {
      if (device.mac === mac) {
        return {
          index: network.index,
          connection: network.wifi_type,
          rssi: device.rssi,
        };
      }
    }
  }
  return undefined;
}

export function stringToFloat(str: string | null): number | null {
  if (str === null) return null
  const nmb = parseFloat(str)
  if (!isNaN(nmb)){
    return nmb
  }
  return null
}

export function stringPercentToFloat(str: string | null): number | null {
  if (str) {
    const nmb = parseFloat(str.replace('%', ''));

    if (!isNaN(nmb)) {
      return nmb / 100;
    }
  }

  return null;
}