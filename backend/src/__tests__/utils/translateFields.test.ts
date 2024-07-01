import path from "path";
import HuaweiWS7001_40Model from "../../utils/dataModels/huaweiWS7001-40"
import fs from 'fs';

describe('translateFields', () => { 
  it('should translate fields from huawei model', () => {
    const model = new HuaweiWS7001_40Model()
    const jsonContent = fs.readFileSync(path.join(__dirname, './informTests/huawei_WS7001-40.json'), 'utf-8');

    // Converte o conteúdo do JSON para objeto JavaScript
    const data = JSON.parse(jsonContent);
    expect(model.translateFields(data)).toEqual({})
  })
})