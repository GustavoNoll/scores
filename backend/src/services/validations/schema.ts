import joi from 'joi';

const client = joi.object({
  latitude: joi.number().min(0).max(90).required(),
  longitude: joi.number().min(-180).max(180).required(),
  mac: joi.alternatives().try(
    joi.string().regex(/^([0-9a-f]{2}:){5}([0-9a-f]{2})$/i).lowercase(),
    joi.string().regex(/^([0-9a-f]{2}-){5}([0-9a-f]{2})$/i).lowercase()
  ),
  integrationId: joi.string().required(),
})

const cto = joi.object({
  description: joi.string().required(),
  latitude: joi.number().min(0).max(90).required(),
  longitude: joi.number().min(-180).max(180).required(),
  integrationId: joi.string().required()
})

const olt = joi.object({
  description: joi.string().required(),
  latitude: joi.number().min(0).max(90).required(),
  longitude: joi.number().min(-180).max(180).required(),
  integrationId: joi.string().required()
})

export = { client, cto, olt}