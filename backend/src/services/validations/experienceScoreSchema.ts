import Joi, { custom } from "joi";

const create = Joi.object({
  uptime: Joi.number().required(),
  txPower: Joi.number().required(),
  cpuUsage: Joi.number().required(),
  memoryUsage: Joi.number().required(),
  rxPower: Joi.number().required(),
  temperature: Joi.number().required(),
  totalConnectedDevices: Joi.number().required(),
  averageWorstRssi: Joi.number().required(),
  connectedDevices5gRatio: Joi.number().required(),
  oltId: Joi.number().allow(null).required(),
  ctoId: Joi.number().allow(null).required(),
})
  .custom((value, helpers) => {
    const {
      uptime,
      txPower,
      cpuUsage,
      memoryUsage,
      rxPower,
      temperature,
      totalConnectedDevices,
      averageWorstRssi,
      connectedDevices5gRatio
    } = value;

    const sum = uptime + txPower + cpuUsage + memoryUsage + rxPower +
      temperature + totalConnectedDevices + averageWorstRssi + connectedDevices5gRatio;

    const epsilon = 1e-6;
    if (Math.abs(sum - 1) > epsilon) {
      return helpers.message({custom: `The sum of all fields must be equal to 1, actual sum is: ${sum}`});
    }

    return value;
  }, 'Experience Score Validation');

export = { create };
