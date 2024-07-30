interface FieldScoreRuleCreateInterface {
  field: string;
  goodThreshold: number;
  mediumThreshold: number;
  poorThreshold: number;
  criticalThreshold: number;
  progressionRate: number;
  oltId: number | null;
  ctoId: number | null;
}

interface FieldScoreRuleUpdateInterface {
  field: string;
  goodThreshold?: number;
  mediumThreshold?: number;
  poorThreshold?: number;
  criticalThreshold?: number;
  progressionRate?: number;
  oltId: number | null;
  ctoId: number | null;
}

export { FieldScoreRuleCreateInterface, FieldScoreRuleUpdateInterface };
