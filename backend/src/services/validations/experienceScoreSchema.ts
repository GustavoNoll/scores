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
  rebootCount: Joi.number().required(),
  protocolCount: Joi.number().required(),
  massiveEventCount: Joi.number().required(),
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
      connectedDevices5gRatio,
      rebootCount,
      protocolCount,
      massiveEventCount
    } = value;

    const sum = Number((uptime + txPower + cpuUsage + memoryUsage + rxPower +
      temperature + totalConnectedDevices + averageWorstRssi + connectedDevices5gRatio + rebootCount + protocolCount + massiveEventCount).toFixed(1));
    if (sum !== 1) {
      return helpers.message({custom: `The sum of all fields must be equal to 1, actual sum is: ${sum.toFixed(1)}`});
    }

    return value;
  }, 'Experience Score Validation');

export = { create };
