interface FieldScoreRuleCreateInterface {
  field: string;
  goodThresholdLow: number;
  criticalThresholdLow: number;
  goodThresholdHigh?: number | null;
  criticalThresholdHigh?: number | null;
  functionType: string;
  oltId: number | null;
  ctoId: number | null;
}

interface FieldScoreRuleUpdateInterface {
  field: string;
  goodThreshold?: number;
  criticalThreshold?: number;
  goodThresholdHigh?: number | null;
  criticalThresholdHigh?: number | null;
  functionType: string;
  oltId: number | null;
  ctoId: number | null;
}

export { FieldScoreRuleCreateInterface, FieldScoreRuleUpdateInterface };
