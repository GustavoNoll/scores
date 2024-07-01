import fs from 'fs';
import path from 'path';
import Device from '../database/models/device';
import DataModel from '../utils/dataModel';

const dataModelsPath = path.join(__dirname, './dataModels');

function loadDataModels(): DataModel[] {
  const models: DataModel[] = [];

  fs.readdirSync(dataModelsPath).forEach(file => {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
      const ModelClass = require(path.join(dataModelsPath, file)).default;
      const modelInstance = new ModelClass();
      if (modelInstance instanceof DataModel) {
        models.push(modelInstance);
      }
    }
  });

  return models;
}

function translateModel(device: Device): DataModel | undefined {
  const models = loadDataModels();
  return models.find(model => model.matches(device));
}

export default translateModel;
