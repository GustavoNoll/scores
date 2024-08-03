import joi from 'joi';

const create = joi.object({
  latitude: joi.number().min(0).max(90).required(),
  longitude: joi.number().min(-180).max(180).required(),
  mac: joi.alternatives().try(
    joi.string().regex(/^([0-9a-f]{2}:){5}([0-9a-f]{2})$/i).lowercase(),
    joi.string().regex(/^([0-9a-f]{2}-){5}([0-9a-f]{2})$/i).lowercase()
  ).required(),
  integrationId: joi.string().required(),
  pppoeUsername: joi.string().optional(),
  serialNumber: joi.string().optional(),
  ctoIntegrationId: joi.string().required(),
  oltIntegrationId: joi.string().required(),
  active: joi.boolean().required()
});

const update = joi.object({
  latitude: joi.number().min(0).max(90).optional(),
  longitude: joi.number().min(-180).max(180).optional(),
  mac: joi.alternatives().try(
    joi.string().regex(/^([0-9a-f]{2}:){5}([0-9a-f]{2})$/i).lowercase(),
    joi.string().regex(/^([0-9a-f]{2}-){5}([0-9a-f]{2})$/i).lowercase()
  ).optional(),
  pppoeUsername: joi.string().optional(),
  serialNumber: joi.string().optional(),
  ctoIntegrationId: joi.string().optional(),
  oltIntegrationId: joi.string().optional(),
  active: joi.boolean().optional()
});

export = { create, update }