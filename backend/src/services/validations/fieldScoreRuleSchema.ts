import Joi from "joi"
import { ALLOWED_FIELDS } from '../../constants/fieldConstants';

const create = Joi.object({
  field: Joi.string().valid(...ALLOWED_FIELDS).required(),
  goodThreshold: Joi.number().required(),
  mediumThreshold: Joi.number().required(),
  poorThreshold: Joi.number().required(),
  criticalThreshold: Joi.number().required(),
  progressionRate: Joi.number().required(),
  oltId: Joi.number().allow(null).required(),
  ctoId: Joi.number().allow(null).required(),
});


export = { create }