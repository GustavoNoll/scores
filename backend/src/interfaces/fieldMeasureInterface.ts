interface FieldMeasureEntry {
  value: number;
  createdAt: Date;
}

interface FieldMeasuresGrouped {
  [field: string]: FieldMeasureEntry[];
}

export { FieldMeasureEntry, FieldMeasuresGrouped };