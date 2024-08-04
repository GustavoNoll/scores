import Joi from "joi";
import { SCORE_FIELDS } from '../../constants/fieldConstants';
import { ALLOWED_FUNCTIONS_TYPES } from "../../constants/functionTypeConstants";

const create = Joi.object({
  field: Joi.string().valid(...SCORE_FIELDS).required(),
  goodThresholdLow: Joi.number().optional(),
  criticalThresholdLow: Joi.number().optional(),
  functionType: Joi.string().valid(...ALLOWED_FUNCTIONS_TYPES).required(),
  goodThresholdHigh: Joi.number().optional(),
  criticalThresholdHigh: Joi.number().optional(),
  oltId: Joi.number().allow(null).required(),
  ctoId: Joi.number().allow(null).required(),
})
  .custom((value, helpers) => {
    const {
      goodThresholdLow,
      criticalThresholdLow,
      goodThresholdHigh,
      criticalThresholdHigh,
    } = value;

    if (
      (goodThresholdLow !== undefined && criticalThresholdLow !== undefined && criticalThresholdLow >= goodThresholdLow) ||
      (goodThresholdHigh !== undefined && goodThresholdLow !== undefined && goodThresholdLow >= goodThresholdHigh) ||
      (criticalThresholdHigh !== undefined && goodThresholdHigh !== undefined && goodThresholdHigh >= criticalThresholdHigh)
    ) {
      return helpers.error('any.invalid');
    }

    return value;
  }, 'Threshold Order Validation');

export = { create };
