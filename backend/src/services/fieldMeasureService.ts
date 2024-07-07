import { ModelStatic } from "sequelize";
import FieldMeasure from "../database/models/fieldMeasure";
import { TranslateFields } from "../utils/dataModelTypes";

class FieldMeasureService {
  private model: ModelStatic<FieldMeasure> = FieldMeasure;

  async generateFieldMeasures(translateFields: TranslateFields) {
    
  }
}
export default FieldMeasureService