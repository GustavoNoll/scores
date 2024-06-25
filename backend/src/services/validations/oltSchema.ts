import joi from "joi"

const oltCreate = joi.object({
  description: joi.string().required(),
  latitude: joi.number().min(0).max(90).required(),
  longitude: joi.number().min(-180).max(180).required(),
  integrationId: joi.string().required()
})

const oltUpdate = joi.object({
  description: joi.string().optional(),
  latitude: joi.number().min(0).max(90).optional(),
  longitude: joi.number().min(-180).max(180).optional(),
})

export = { oltCreate, oltUpdate }