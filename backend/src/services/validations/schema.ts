import joi from 'joi';

const acsInform = joi.object({
  deviceTag: joi.string().required(),
  jsonData: joi.object().required()
})

export = { acsInform }