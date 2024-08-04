interface FieldScoreRuleCreateInterface {
  field: string;
  goodThreshold: number;
  criticalThreshold: number;
  goodThresholdAdditional?: number | null;
  criticalThresholdAdditional?: number | null;
  functionType: string;
  oltId: number | null;
  ctoId: number | null;
}

interface FieldScoreRuleUpdateInterface {
  field: string;
  goodThreshold?: number;
  criticalThreshold?: number;
  goodThresholdAdditional?: number | null;
  criticalThresholdAdditional?: number | null;
  functionType: string;
  oltId: number | null;
  ctoId: number | null;
}

export { FieldScoreRuleCreateInterface, FieldScoreRuleUpdateInterface };
