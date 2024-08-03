interface FieldScoreRuleCreateInterface {
  field: string;
  goodThreshold: number;
  criticalThreshold: number;
  functionType: string;
  oltId: number | null;
  ctoId: number | null;
}

interface FieldScoreRuleUpdateInterface {
  field: string;
  goodThreshold?: number;
  criticalThreshold?: number;
  functionType: string;
  oltId: number | null;
  ctoId: number | null;
}

export { FieldScoreRuleCreateInterface, FieldScoreRuleUpdateInterface };
