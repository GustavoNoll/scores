// utils/fieldScore/fieldScoreEvaluator.ts

import FieldScoreRule from "../../database/models/fieldScoreRule";


export function evaluateFieldScore(value: number, rule: FieldScoreRule): number | null {
  switch (rule.functionType) {
    case 'linear':
      return evaluateLinear(value, rule);
    case 'cubic':
      return evaluateCubic(value, rule);
    case 'quadratic':
      return evaluateQuadratic(value, rule);
    case 'exponential':
      return evaluateExponential(value, rule);
    default:
      return null;
  }
}

function evaluateLinear(value: number, rule: FieldScoreRule): number | null {
  if (rule.goodThresholdAdditional !== null && rule.criticalThresholdAdditional !== null) {
    if (value >= rule.goodThreshold && value <= rule.goodThresholdAdditional) {
      return 1;
    } else if (value <= rule.criticalThreshold || value >= rule.criticalThresholdAdditional) {
      return 0;
    } else {
      if (value < rule.goodThreshold){
        const t = (value - rule.goodThreshold) / (rule.criticalThreshold - rule.goodThreshold);
        return Math.max(0, 1 - t);
      }else if ( value > rule.goodThresholdAdditional){
        const t = (value - rule.goodThresholdAdditional) / (rule.criticalThresholdAdditional - rule.goodThresholdAdditional);
        return Math.max(0, 1 - t);
      }
    } 
  } else {
    if (value <= rule.goodThreshold) {
      return 1;
    } else if (value > rule.goodThreshold && value <= rule.criticalThreshold) {
      const t = (value - rule.goodThreshold) / (rule.criticalThreshold - rule.goodThreshold);
      return Math.max(0, 1 - t);
    } else {
      return 0;
    }
  }
  return null;
}

function evaluateCubic(value: number, rule: FieldScoreRule): number | null{
  if (rule.goodThresholdAdditional !== null && rule.criticalThresholdAdditional !== null) {
    if (value >= rule.goodThreshold && value <= rule.goodThresholdAdditional) {
      return 1;
    } else if (value <= rule.criticalThreshold || value >= rule.criticalThresholdAdditional) {
      return 0;
    } else {
      if (value < rule.goodThreshold){
        const t = (value - rule.criticalThreshold) / (rule.goodThreshold - rule.criticalThreshold);
        return 1 - Math.pow(t, 3);
      }else if ( value > rule.goodThresholdAdditional){
        const t = (value - rule.goodThresholdAdditional) / (rule.criticalThresholdAdditional - rule.goodThresholdAdditional);
        return Math.max(0, 1 - Math.pow(t, 3));
      }
    }
  } else {
    if (value >= rule.goodThreshold) {
      return 1;
    } else if (value <= rule.criticalThreshold) {
      return 0;
    } else {
      const t = (value - rule.criticalThreshold) / (rule.goodThreshold - rule.criticalThreshold);
      return 1 - Math.pow(t, 3);
    }
  }
  return null
}

function evaluateQuadratic(value: number, rule: FieldScoreRule): number | null {
  if (rule.goodThresholdAdditional !== null && rule.criticalThresholdAdditional !== null) {
    if (value >= rule.goodThreshold && value <= rule.goodThresholdAdditional) {
      return 1;
    } else if (value <= rule.criticalThreshold || value >= rule.criticalThresholdAdditional) {
      return 0;
    } else {
      if (value < rule.goodThreshold){
        const t = (value - rule.goodThreshold) / (rule.criticalThreshold - rule.goodThreshold);
        return Math.max(0, 1 - Math.pow(t, 2));
      }else if ( value > rule.goodThresholdAdditional){
        const t = (value - rule.goodThresholdAdditional) / (rule.criticalThresholdAdditional - rule.goodThresholdAdditional);
        return Math.max(0, 1 - Math.pow(t, 2));
      }
    }
  } else {
    if (value >= rule.goodThreshold) {
      return 1;
    } else if (value <= rule.criticalThreshold) {
      return 0;
    } else {
      const t = (value - rule.goodThreshold) / (rule.criticalThreshold - rule.goodThreshold);
      return Math.max(0, 1 - Math.pow(t, 2));
    }
  }
  return null;
}

function evaluateExponential(value: number, rule: FieldScoreRule): number | null {
  if (rule.goodThresholdAdditional !== null && rule.criticalThresholdAdditional !== null) {
    if (value >= rule.goodThreshold && value <= rule.goodThresholdAdditional) {
      return 1;
    } else if (value <= rule.criticalThreshold || value >= rule.criticalThresholdAdditional) {
      return 0;
    } else {
      if (value < rule.goodThreshold) {
        const t = (value - rule.goodThreshold) / (rule.criticalThreshold - rule.goodThreshold);
        return Math.max(0, Math.min(1, Math.exp(-10 * t)));
      } else if (value > rule.goodThresholdAdditional) {
        const t = (value - rule.goodThresholdAdditional) / (rule.criticalThresholdAdditional - rule.goodThresholdAdditional);
        return Math.max(0, Math.min(1, Math.exp(-10 * t)));
      }
    }
  } else {
    if (value >= rule.goodThreshold) {
      return 1;
    } else if (value <= rule.criticalThreshold) {
      return 0;
    } else {
      const t = (value - rule.criticalThreshold) / (rule.goodThreshold - rule.criticalThreshold);
      return Math.max(0, 1 - Math.exp(-0.1 * t));
    }
  }
  return null;
}
