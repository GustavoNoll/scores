import translateModel from '../../utils/translateModel';
import HuaweiWS7001_40Model from '../../utils/dataModels/huaweiWS7001-40';
import Device from '../../database/models/device';
import ZteF670LModel from '../../utils/dataModels/zteF670Lv9';

describe('translateModel', () => {
  it('should return the correct model for a matching device', () => {
    const device = Device.build({
      manufacturer: 'Huawei Technologies Co., Ltd',
      oui: '00259E',
      productClass: 'Huawei',
      modelName: 'WS7001-40',
      hardwareVersion: '1.2',
      softwareVersion: '1.4',
    });

    const model = translateModel(device);
    expect(model).toBeInstanceOf(HuaweiWS7001_40Model);
  });

  it('should return the correct model for a matching device', () => {
    const device = Device.build({
      manufacturer: 'Zte',
      oui: '00259E',
      productClass: 'F670L',
      modelName: 'F670L',
      hardwareVersion: 'v9.0',
      softwareVersion: '1.4',
    });

    const model = translateModel(device);
    expect(model).toBeInstanceOf(ZteF670LModel);
  });
  

  it('should return undefined for a non-matching device', () => {
    const device = Device.build({
      manufacturer: 'Unknown',
      oui: '000000',
      productClass: 'unknown',
      modelName: 'unknown',
      hardwareVersion: 'unknown',
      softwareVersion: 'unknown',
    });

    const model = translateModel(device);
    expect(model).toBeUndefined();
  });
});
