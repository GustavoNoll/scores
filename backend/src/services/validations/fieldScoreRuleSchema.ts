import Joi from "joi"
import { SCORE_FIELDS } from '../../constants/fieldConstants';
import { ALLOWED_FUNCTIONS_TYPES } from "../../constants/functionTypeConstants";

const create = Joi.object({
  field: Joi.string().valid(...SCORE_FIELDS).required(),
  goodThreshold: Joi.number().required(),
  criticalThreshold: Joi.number().required(),
  functionType: Joi.string().valid(...ALLOWED_FUNCTIONS_TYPES).required(),
  oltId: Joi.number().allow(null).required(),
  ctoId: Joi.number().allow(null).required(),
});


export = { create }