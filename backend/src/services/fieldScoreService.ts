import { ModelStatic, UniqueConstraintError } from "sequelize";
import FieldScore from "../database/models/fieldScore";
import FieldMeasure from "../database/models/fieldMeasure";
import FieldMeasureService from "./fieldMeasureService";
import Client from "../database/models/client";
import Device from "../database/models/device";
import FieldScoreRule from "../database/models/fieldScoreRule";


class FieldScoreService {
  private model: ModelStatic<FieldScore> = FieldScore;

  async generateScores(device: Device, client: Client): Promise<boolean>{
    const fieldMeasureService = new FieldMeasureService()
    const fieldMeasures = await fieldMeasureService.getFieldMeasuresLast7Days(device)
    const scores: Record<string, number | null> = {};

    // Step 3: Iterate over each field (e.g., cpuUsage, memoryUsage, etc.)
    for (const [field, measures] of Object.entries(fieldMeasures)) {
      const validMeasuresByDay = FieldMeasure.groupMeasuresByDay(measures);

      // Step 4: Check if there are measures for at least 4 different days
      if (hasEnoughDays(validMeasuresByDay)) {
        // Step 5: Calculate the average score for this field
        scores[field] = await this.calculateScoreForField(field,validMeasuresByDay, device);
      } else {
        // Not enough data, assign null
        scores[field] = null;
      }
    }
    return true
  }

   async calculateScoreForField(field: string, measuresByDay: Map<string, number[]>, device: Device): Promise<number> {
    const rule = await FieldScoreRule.getFieldScoreRuleForDevice(device, field)
    if (!rule) {
      throw new Error(`No FieldScoreRule found for device ${device.id} and field ${field}`);
    }
    return 1;
  }
}
function hasEnoughDays(measuresByDay: Map<string, number[]>): boolean {
  const MIN_REQUIRED_DAYS = 4;
  return measuresByDay.size >= MIN_REQUIRED_DAYS;
}
export default FieldScoreService