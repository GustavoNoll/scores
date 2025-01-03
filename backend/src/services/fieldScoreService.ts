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
      if (hasEnoughDays(field, validMeasuresByDay)) {
        // Step 5: Calculate the average score for this field
        scores[field] = await this.calculateScoreForField(field,validMeasuresByDay, device);
      } else {
        // Not enough data, assign null
        scores[field] = null;
      }
    }
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
    const rule = await FieldScoreRule.getFieldScoreRuleForDevice(device, field);
    if (!rule) {
      throw new Error(`No FieldScoreRule found for device ${device.id} and field ${field}`);
    }

    const calculationMethod = fieldCalculationMethods[field] || 'averageScores';
    let avgScore: number;

    if (calculationMethod === 'averageScores') {
      avgScore = this.calculateAverageScores(measuresByDay, rule);
    } else if (calculationMethod === 'sumThenScore') {
      avgScore = this.calculateSumThenScore(measuresByDay, rule);
    } else {
      throw new Error(`Invalid calculation method for field ${field}`);
    }

    if (avgScore > 1 || avgScore < 0) {
      throw new Error(`Invalid score range for field ${field} (score: ${avgScore})`);
    }
    return avgScore;
  }

  private calculateAverageScores(measuresByDay: Map<string, number[]>, rule: FieldScoreRule): number {
    let totalSum = 0;
    let totalCount = 0;

    measuresByDay.forEach((values) => {
      values.forEach(value => {
        const score = evaluateFieldScore(value, rule);
        if (score === null) {
          throw new Error(`Invalid score for value: ${value}, rule: ${JSON.stringify(rule)}`);
        }
        totalSum += score;
        totalCount += 1;
      });
    });

    return totalSum / totalCount;
  }

  private calculateSumThenScore(measuresByDay: Map<string, number[]>, rule: FieldScoreRule): number {
    let totalSum = 0;

    measuresByDay.forEach((values) => {
      values.forEach(value => {
        totalSum += value;
      });
    });
    const score = evaluateFieldScore(totalSum, rule);
    if (score === null) {
      throw new Error(`Invalid score for average value: ${totalSum}, rule: ${JSON.stringify(rule)}`);
    }
    return score;
  }
}

const fieldCalculationMethods: Record<string, 'averageScores' | 'sumThenScore'> = {
  rebootCount: 'sumThenScore',
  protocolCount: 'sumThenScore',
  massiveEventCount: 'sumThenScore',
};

function hasEnoughDays(field: string, measuresByDay: Map<string, number[]>): boolean {
  if (fieldCalculationMethods[field] === 'sumThenScore') {
    return true
  }
  return measuresByDay.size >= MIN_REQUIRED_DIFFERENT_DAYS_OF_A_FIELD_TO_CALCULATE_SCORE;
}
export default FieldScoreService