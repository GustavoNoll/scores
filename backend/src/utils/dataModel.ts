import Device from "../database/models/device";
import { deepFind, serialNumberShortForm, standardizeMac } from "./convertUtils";
import { CpuUsage, MemoryUsage, RxPower, Temperature, TxPower, Uptime, Voltage, WifiConnectedDevices, WifiNetworks } from "./dataModelTypes";

class DataModel {
  public manufacturer: string;
  public oui: string;
  public productClass: string;
  public modelName: string;
  public hardwareVersion: string;
  public softwareVersion: string;

  constructor({
    manufacturer,
    oui,
    productClass,
    modelName,
    hardwareVersion,
    softwareVersion,
  }: {
    manufacturer: string;
    oui: string;
    productClass: string;
    modelName: string;
    hardwareVersion: string;
    softwareVersion: string;
  }) {
    this.manufacturer = manufacturer;
    this.oui = oui;
    this.productClass = productClass;
    this.modelName = modelName;
    this.hardwareVersion = hardwareVersion;
    this.softwareVersion = softwareVersion;
  }

  matches(device: Device): boolean {
    return (
      (this.manufacturer === '*' || this.manufacturer.toLowerCase() === device.manufacturer.toLowerCase()) &&
      (this.oui === '*' || this.oui.toLowerCase() === device.oui.toLowerCase()) &&
      (this.productClass === '*' || this.productClass.toLowerCase() === device.productClass.toLowerCase()) &&
      (this.modelName === '*' || this.modelName.toLowerCase() === device.modelName.toLowerCase()) &&
      (this.hardwareVersion === '*' || this.hardwareVersion.toLowerCase() === device.hardwareVersion.toLowerCase()) &&
      (this.softwareVersion === '*' || this.softwareVersion.toLowerCase() === device.softwareVersion.toLowerCase())
    );
  }

  translateFields(jsonData: any): any {
    let data = {
      uptime: this.getUptime(jsonData), // seconds
      temperature: this.getTemperature(jsonData), // celsius
      rxPower: this.getRxPower(jsonData), // dbm
      txPower: this.getTxPower(jsonData), // dbm
      voltage: this.getVoltage(jsonData), // mv
      memoryUsage: this.getMemoryUsage(jsonData), // 0-1
      cpuUsage: this.getCpuUsage(jsonData), // 0-1
      wifiConnectedDevices: this.getWifiConnectedDevices(jsonData),
      wifiNetworks: this.getWifiNetworks(jsonData)
    }
    return data;
  }

  getUptime(jsonData: any): Uptime {
    return jsonData.InternetGatewayDevice?.DeviceInfo?.UpTime?._value || null;
  }

  getTemperature(jsonData: any): Temperature {
    return null; // Por enquanto retorna null, implemente conforme sua necessidade
  }

  getRxPower(jsonData: any): RxPower {
    return null; // Por enquanto retorna null, implemente conforme sua necessidade
  }

  getTxPower(jsonData: any): TxPower {
    return null; // Por enquanto retorna null, implemente conforme sua necessidade
  }

  getVoltage(jsonData: any): Voltage {
    return null; // Por enquanto retorna null, implemente conforme sua necessidade
  }

  getMemoryUsage(jsonData: any): MemoryUsage {
    return null; // Por enquanto retorna null, implemente conforme sua necessidade
  }

  getCpuUsage(jsonData: any): CpuUsage {
    return null;
  }

  getWifiConnectedDevices(jsonData: any): WifiConnectedDevices{
    return []; // Retorna array vazio por padrão
  }

  getWifiNetworks(jsonData: any): WifiNetworks{
    return [];
  }
  
  static getBaseDevice(jsonData: any): any {
    return {
      manufacturer: this.getManufacturer(jsonData),
      oui: this.getOui(jsonData),
      productClass: this.getProductClass(jsonData),
      modelName: this.getModelName(jsonData),
      hardwareVersion: this.getHardwareVersion(jsonData),
      softwareVersion: this.getSoftwareVersion(jsonData),
      pppoeUsername: this.getPPPoeUsername(jsonData),
      mac: this.getMac(jsonData),
      serialNumber: this.getSerialNumber(jsonData),
    };
  }
  private static getBaseany(jsonData: any): any {
    return jsonData.Device || jsonData.InternetGatewayDevice || {};
  }

  private static getPPPoeUsername(jsonData: any): string | null {
    const igdPath = ['InternetGatewayDevice', 'WANDevice', 'WANConnectionDevice', 'WANPPPConnection'];
    const devicePath = ['Device', 'PPP', 'Interface']
    let username = deepFind(jsonData, [...igdPath, 'Username', '_value']);
    if (username) return username;

    username = deepFind(jsonData, [...devicePath, 'Username', '_value']);
    return username;
  }

  private static getMac(jsonData: any): string | null {
    const igdPath = ['InternetGatewayDevice', 'WANDevice', 'WANConnectionDevice', 'WANPPPConnection', 'MACAddress', '_value'];
    const lanPath = ['Device', 'LAN', 'MACAddress', '_value'];
    const ethernetPath = ['Device', 'Ethernet', 'Link', 'MACAddress', '_value'];

    let macAddress = deepFind(jsonData, igdPath);
    if (macAddress) return standardizeMac(macAddress);

    macAddress = deepFind(jsonData, lanPath);
    if (macAddress) return standardizeMac(macAddress);

    macAddress = deepFind(jsonData, ethernetPath);
    return standardizeMac(macAddress);
  }

  private static getSerialNumber(jsonData: any): string | null {
    const base = this.getBaseany(jsonData);
    return serialNumberShortForm(base.DeviceInfo?.SerialNumber?._value || null);
  }

  private static getManufacturer(jsonData: any): string | null {
    const base = this.getBaseany(jsonData);
    return base.DeviceInfo?.Manufacturer?._value || null;
  }

  private static getOui(jsonData: any): string | null {
    const base = this.getBaseany(jsonData);
    return base.DeviceInfo?.ManufacturerOUI?._value || null;
  }

  private static getProductClass(jsonData: any): string | null {
    const base = this.getBaseany(jsonData);
    return base.DeviceInfo?.ProductClass?._value || null;
  }

  private static getModelName(jsonData: any): string | null {
    const base = this.getBaseany(jsonData);
    return base.DeviceInfo?.ModelName?._value || null;
  }

  private static getHardwareVersion(jsonData: any): string | null {
    const base = this.getBaseany(jsonData);
    return base.DeviceInfo?.HardwareVersion?._value || null;
  }

  private static getSoftwareVersion(jsonData: any): string | null {
    const base = this.getBaseany(jsonData);
    return base.DeviceInfo?.SoftwareVersion?._value || null;
  }
}


export default DataModel
