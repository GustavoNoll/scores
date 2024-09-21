import { ModelStatic, UniqueConstraintError } from "sequelize";
import FieldScore from "../database/models/fieldScore";
import FieldMeasure from "../database/models/fieldMeasure";
import FieldMeasureService from "./fieldMeasureService";
import Client from "../database/models/client";
import Device from "../database/models/device";
import FieldScoreRule from "../database/models/fieldScoreRule";
import { evaluateFieldScore } from "../utils/fieldScore/fieldScoreEvaluator";
import ClientScoreService from "./clientScoreService";
import { MIN_REQUIRED_DIFFERENT_DAYS_OF_A_FIELD_TO_CALCULATE_SCORE, MIN_REQUIRED_DIFFERENT_VALID_FIELDS_TO_CALCULATE_SCORE } from "../constants/processConstants";


class FieldScoreService {
  private model: ModelStatic<FieldScore> = FieldScore;

  async processScores(device: Device, client: Client): Promise<boolean>{
    const fieldMeasureService = new FieldMeasureService()
    const clientScoreService = new ClientScoreService()
    const fieldMeasures = await fieldMeasureService.getFieldMeasuresLast7Days(device)
    const scores: Record<string, number | null> = {};
    // Step 3: Iterate over each field (e.g., cpuUsage, memoryUsage, etc.)
    for (const [field, measures] of Object.entries(fieldMeasures)) {
      const validMeasuresByDay = FieldMeasure.getFieldMeasureGroupedByDay(measures);

      // Step 4: Check if there are measures for at least 4 different days
      if (hasEnoughDays(validMeasuresByDay)) {
        // Step 5: Calculate the average score for this field
        scores[field] = await this.calculateScoreForField(field,validMeasuresByDay, device);
      } else {
        // Not enough data, assign null
        scores[field] = null;
      }
    }
    console.log(scores)
    const nonNullValues = Object.values(scores).filter(value => value !== null);
    if (nonNullValues.length >= MIN_REQUIRED_DIFFERENT_VALID_FIELDS_TO_CALCULATE_SCORE) {
      // Step 6: Save the scores to the database and create clientScore
      const fieldScores = await FieldScore.bulkCreateFieldScores(scores, device.id, client.id)
      await clientScoreService.generateClientScore(client.id, fieldScores)
    }else {
      throw new Error('Not enough data to calculate scores for client')
    }
    return true
  }

   async calculateScoreForField(field: string, measuresByDay: Map<string, number[]>, device: Device): Promise<number> {
    const rule = await FieldScoreRule.getFieldScoreRuleForDevice(device, field)

    if (!rule) {
      throw new Error(`No FieldScoreRule found for device ${device.id} and field ${field}`);
    }
    let totalSum = 0;
    let totalCount = 0;

    // Iterar sobre o objeto e calcular a soma e o número de elementos
    measuresByDay.forEach((values, key) => {
      values.forEach(value => {
        const score = evaluateFieldScore(value, rule) ;
        if (score === null){
          throw new Error(`Invalid score for field ${field} (value: ${value}, rule: ${JSON.stringify(rule)})`);
        }
        totalSum += score;
        totalCount += 1;
      });
    });

    // Calcular a média
    const avgScore = totalSum / totalCount;

    if (avgScore > 1 || avgScore < 0) {
      throw new Error(`Invalid score range for field ${field} (score: ${avgScore})`);
    }
    return avgScore;
  }
}
function hasEnoughDays(measuresByDay: Map<string, number[]>): boolean {
  return measuresByDay.size >= MIN_REQUIRED_DIFFERENT_DAYS_OF_A_FIELD_TO_CALCULATE_SCORE;
}
export default FieldScoreService