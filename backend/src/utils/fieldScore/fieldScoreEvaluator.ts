// utils/fieldScore/fieldScoreEvaluator.ts

import FieldScoreRule from "../../database/models/fieldScoreRule";


export function evaluateFieldScore(value: number, rule: FieldScoreRule): number | null {

  if (rule.goodThresholdHigh !== null &&
    rule.criticalThresholdHigh !== null &&
    rule.goodThresholdLow !== null &&
    rule.criticalThresholdLow !== null){ 
      if (value >= rule.goodThresholdLow && value <= rule.goodThresholdHigh) {
        return 1;
      } else if (value <= rule.criticalThresholdLow || value >= rule.criticalThresholdHigh) {
        return 0;
      } else {
        if (value < rule.goodThresholdLow){
          return calculateByFunctionType(value, rule.goodThresholdLow, rule.criticalThresholdLow, rule.functionType)
        }else if ( value > rule.goodThresholdHigh){
          return calculateByFunctionType(value, rule.goodThresholdHigh, rule.criticalThresholdHigh, rule.functionType)
        }
      }
  } else if ((rule.goodThresholdLow !== null && rule.criticalThresholdLow !== null)){
    if (value >= rule.goodThresholdLow) {
      return 1;
    } else if (value <= rule.criticalThresholdLow) {
      return 0;
    }else{
      return calculateByFunctionType(value, rule.goodThresholdLow, rule.criticalThresholdLow, rule.functionType)
    }
  } else if ((rule.goodThresholdHigh !== null && rule.criticalThresholdHigh !== null)){
    if (value <= rule.goodThresholdHigh) {
      return 1;
    } else if (value >= rule.criticalThresholdHigh) {
      return 0;
    }else{
      return calculateByFunctionType(value, rule.goodThresholdHigh, rule.criticalThresholdHigh, rule.functionType)
    }
  }
  return null;
}

function calculateByFunctionType(value: number, thresholdLow: number, thresholdHigh: number, functionType: string): number | null {
  switch (functionType) {
    case 'linear':
      return calculateLinearScore(value, thresholdLow, thresholdHigh);
    case 'cubic':
      return calculateCubicScore(value, thresholdLow, thresholdHigh);
    case 'quadratic':
      return calculateQuadraticScore(value, thresholdLow, thresholdHigh);
    case 'exponential':
      return calculateExponentialScore(value, thresholdLow, thresholdHigh);
    default:
      return null;
  }
}
function calculateLinearScore(value: number, thresholdLow: number, thresholdHigh: number): number {
  const t = (value - thresholdLow) / (thresholdHigh - thresholdLow);
  return Math.max(0, 1 - t);
}

function calculateCubicScore(value: number, thresholdLow: number, thresholdHigh: number): number {
  const t = (value - thresholdLow) / (thresholdHigh - thresholdLow);
  return Math.max(0, 1 - Math.pow(t, 3));
}

function calculateQuadraticScore(value: number, thresholdLow: number, thresholdHigh: number): number {
  const t = (value - thresholdLow) / (thresholdHigh - thresholdLow);
  return Math.max(0, 1 - Math.pow(t, 2));
}

function calculateExponentialScore(value: number, thresholdLow: number, thresholdHigh: number): number {
  const t = (value - thresholdLow) / (thresholdHigh - thresholdLow);
  return Math.max(0, Math.min(1, Math.exp(-10 * t)));
}