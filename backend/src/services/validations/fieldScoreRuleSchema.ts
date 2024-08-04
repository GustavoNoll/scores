import Joi, { custom } from "joi";
import { SCORE_FIELDS } from '../../constants/fieldConstants';
import { ALLOWED_FUNCTIONS_TYPES } from "../../constants/functionTypeConstants";


const create = Joi.object({
  field: Joi.string().valid(...SCORE_FIELDS).required(),
  goodThresholdLow: Joi.number().allow(null).required(),
  criticalThresholdLow: Joi.number().allow(null).required(),
  functionType: Joi.string().valid(...ALLOWED_FUNCTIONS_TYPES).required(),
  goodThresholdHigh: Joi.number().allow(null).required(),
  criticalThresholdHigh: Joi.number().allow(null).required(),
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
      (goodThresholdLow !== null && criticalThresholdLow !== null && criticalThresholdLow >= goodThresholdLow) ||
      (goodThresholdHigh !== null && goodThresholdLow !== null && goodThresholdLow >= goodThresholdHigh) ||
      (criticalThresholdHigh !== null && goodThresholdHigh !== null && goodThresholdHigh >= criticalThresholdHigh)
    ) {
      return helpers.message({custom: 'Wrong threshold order'});
    }

    return value;
  }, 'Threshold Order Validation')
  .custom((value, helpers) => {
    const {
      goodThresholdLow,
      criticalThresholdLow,
    } = value;

    if (
      (goodThresholdLow !== null && criticalThresholdLow === null
        || goodThresholdLow === null && criticalThresholdLow !== null
      )
    ) {
      return helpers.message({custom: 'Missing a threshold'});
    }
    return value;
  }, 'Threshold Missing Validation')
  .custom((value, helpers) => {
    const {
      goodThresholdHigh,
      criticalThresholdHigh,
    } = value;

    if (
      (goodThresholdHigh !== null && criticalThresholdHigh === null
        || goodThresholdHigh === null && criticalThresholdHigh !== null
      )
    ) {
      return helpers.message({custom: 'Missing a threshold'});
    }
    return value;
  }, 'Threshold Missing Validation');

export = { create };
