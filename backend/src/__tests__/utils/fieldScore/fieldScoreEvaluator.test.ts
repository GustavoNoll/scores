// __tests__/fieldScoreEvaluator.test.ts

import FieldScoreRule from '../../../database/models/fieldScoreRule';
import { evaluateFieldScore } from '../../../utils/fieldScore/fieldScoreEvaluator';

describe('Field Score Evaluator', () => {
  const createMockFieldScoreRule = (data: Partial<FieldScoreRule>): FieldScoreRule => {
    return {
      field: 'example',
      goodThresholdLow: 0,
      criticalThresholdLow: 0,
      goodThresholdHigh: null,
      criticalThresholdHigh: null,
      functionType: 'linear',
      ...data,
    } as FieldScoreRule;
  };

  test('evaluateLinear with two good and two critical thresholds', () => {
    const rule = createMockFieldScoreRule({
      goodThresholdLow: 10,
      criticalThresholdLow: 5,
      goodThresholdHigh: 15,
      criticalThresholdHigh: 18,
      functionType: 'linear',
    });

    expect(evaluateFieldScore(10, rule)).toBe(1);
    expect(evaluateFieldScore(9, rule)).toBe(0.8);
    expect(evaluateFieldScore(6, rule)).toBeCloseTo(0.2, 1);
    expect(evaluateFieldScore(5, rule)).toBe(0);

    expect(evaluateFieldScore(12, rule)).toBe(1);
    expect(evaluateFieldScore(16, rule)).toBeCloseTo(0.666666666666666, 3);
    expect(evaluateFieldScore(17, rule)).toBeCloseTo(0.3333333333333333, 3);
    expect(evaluateFieldScore(18, rule)).toBe(0);
    expect(evaluateFieldScore(19, rule)).toBe(0);
  });

  test('evaluateLinear with one good and one critical threshold', () => {
    const rule = createMockFieldScoreRule({
      field: 'example',
      goodThresholdLow: 10,
      criticalThresholdLow: 0,
      functionType: 'linear',
    });

    expect(evaluateFieldScore(12, rule)).toBe(1);
    expect(evaluateFieldScore(5, rule)).toBe(0.5);
    expect(evaluateFieldScore(1, rule)).toBeCloseTo(0.09, 1);
  });

  test('evaluateCubic with two good and two critical thresholds', () => {
    const rule = createMockFieldScoreRule({
      field: 'example',
      goodThresholdLow: 10,
      criticalThresholdLow: 5,
      goodThresholdHigh: 15,
      criticalThresholdHigh: 18,
      functionType: 'cubic',
    });

    expect(evaluateFieldScore(11, rule)).toBe(1);
    expect(evaluateFieldScore(14, rule)).toBe(1);
    expect(evaluateFieldScore(5, rule)).toBe(0);
    expect(evaluateFieldScore(18, rule)).toBe(0);
    expect(evaluateFieldScore(16, rule)).toBeCloseTo(0.962962962962963, 5);
    expect(evaluateFieldScore(17, rule)).toBeCloseTo(0.7037037037037037, 5);
    expect(evaluateFieldScore(18, rule)).toBeCloseTo(0, 5);
    expect(evaluateFieldScore(19, rule)).toBeCloseTo(0, 5);
  });


  test('evaluateQuadratic with one good and one critical thresholds', () => {
    const rule = createMockFieldScoreRule ({
      field: 'example',
      goodThresholdLow: 10,
      criticalThresholdLow: 5,
      goodThresholdHigh: null,
      criticalThresholdHigh: null,
      functionType: 'quadratic',
    });

    expect(evaluateFieldScore(12, rule)).toBeCloseTo(1, 5);
    expect(evaluateFieldScore(15, rule)).toBeCloseTo(1, 5);
    expect(evaluateFieldScore(5, rule)).toBeCloseTo(0, 5);
    expect(evaluateFieldScore(6, rule)).toBeCloseTo(0.35, 1);
    expect(evaluateFieldScore(7, rule)).toBeCloseTo(0.6, 1);
    expect(evaluateFieldScore(9, rule)).toBeCloseTo(0.95, 1);
  });
  test('evaluateQuadratic with two good and two critical thresholds', () => {
    const rule = createMockFieldScoreRule ({
      field: 'example',
      goodThresholdLow: 10,
      criticalThresholdLow: 5,
      goodThresholdHigh: 15,
      criticalThresholdHigh: 18,
      functionType: 'quadratic',
    });

    expect(evaluateFieldScore(12, rule)).toBeCloseTo(1, 5);
    expect(evaluateFieldScore(15, rule)).toBeCloseTo(1, 5);
    expect(evaluateFieldScore(5, rule)).toBeCloseTo(0, 5);
    expect(evaluateFieldScore(18, rule)).toBeCloseTo(0, 5);
    expect(evaluateFieldScore(16, rule)).toBeCloseTo(0.8, 0);
    expect(evaluateFieldScore(17, rule)).toBeCloseTo(0.7, 0);
  });


  test('evaluateExponential with one good and one critical thresholds', () => {
    const rule = createMockFieldScoreRule({
      field: 'example',
      goodThresholdLow: 10,
      criticalThresholdLow: 5,
      goodThresholdHigh: null,
      criticalThresholdHigh: null,
      functionType: 'exponential',
    });
    expect(evaluateFieldScore(12, rule)).toBe(1);
    expect(evaluateFieldScore(15, rule)).toBe(1);

    expect(evaluateFieldScore(9.9, rule)).toBeCloseTo(0.8, 1);
    expect(evaluateFieldScore(6, rule)).toBeCloseTo(0, 1);
    expect(evaluateFieldScore(8, rule)).toBeCloseTo(0, 1);


  });

  test('evaluateExponential with two good and two critical thresholds', () => {
    const rule = createMockFieldScoreRule({
      field: 'example',
      goodThresholdLow: 10,
      criticalThresholdLow: 5,
      goodThresholdHigh: 15,
      criticalThresholdHigh: 20,
      functionType: 'exponential',
    });
    expect(evaluateFieldScore(12, rule)).toBe(1);
    expect(evaluateFieldScore(15, rule)).toBe(1);
    expect(evaluateFieldScore(21, rule)).toBe(0);
    expect(evaluateFieldScore(4, rule)).toBe(0);

    expect(evaluateFieldScore(15.1, rule)).toBeCloseTo(0.8, 1);
    expect(evaluateFieldScore(16, rule)).toBeCloseTo(0.1, 1);
    expect(evaluateFieldScore(18, rule)).toBeCloseTo(0, 1);
    expect(evaluateFieldScore(19, rule)).toBeCloseTo(0, 1);

    expect(evaluateFieldScore(6, rule)).toBeCloseTo(0, 1);
    expect(evaluateFieldScore(8, rule)).toBeCloseTo(0, 1);
    expect(evaluateFieldScore(9.9, rule)).toBeCloseTo(0.8, 1);
  });

  test('evaluateFieldScore should return null for unsupported function types', () => {
    const rule = createMockFieldScoreRule({
      goodThresholdLow: 10,
      criticalThresholdLow: 5,
      functionType: 'unsupported' as any,
    });

    expect(evaluateFieldScore(6, rule)).toBeNull();
  });
});
