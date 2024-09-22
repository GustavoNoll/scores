import schema from "../../../services/validations/fieldScoreRuleSchema";


describe('FieldScoreRuleSchema', () => {
  it('should validate a correct field score rule', () => {
    const validRule = {
      field: 'cpuUsage',
      goodThresholdLow: 0,
      criticalThresholdLow: -10,
      functionType: 'linear',
      goodThresholdHigh: 80,
      criticalThresholdHigh: 100,
      oltId: null,
      ctoId: null,
    };

    const result = schema.create.validate(validRule);
    expect(result.error).toBeUndefined();
  });

  it('should reject an invalid field', () => {
    const invalidRule = {
      field: 'invalidField',
      goodThresholdLow: 0,
      criticalThresholdLow: 20,
      functionType: 'linear',
      goodThresholdHigh: 80,
      criticalThresholdHigh: 100,
      oltId: null,
      ctoId: null,
    };

    const result = schema.create.validate(invalidRule);
    expect(result.error).toBeDefined();
  });

  it('should reject when thresholds are in wrong order', () => {
    const invalidRule = {
      field: 'cpuUsage',
      goodThresholdLow: 10,
      criticalThresholdLow: 20,
      functionType: 'linear',
      goodThresholdHigh: 80,
      criticalThresholdHigh: 100,
      oltId: null,
      ctoId: null,
    };

    const result = schema.create.validate(invalidRule);
    console
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('Wrong threshold order');
  });
});