const Joi = require('joi');

/**
 * @description
 *  Schema to validate the request body when creating a cronogram
 *  based on the model in 'src/models/Cronograma/index.js'
 */

module.exports = Joi.object({
  title: Joi.string()
    .required()
    .messages({ 'any.required': '"Título" é um campo obrigatório' }),
  description: Joi.string(),
  startDate: Joi.date().iso().required().messages({
    'date.base': '"Data inicial" deve ser uma data válida',
    'date.iso': '"Data inicial" deve estar no formato ISO 8601',
    'any.required': '"Data inicial" é um campo obrigatório'
  }),
  endDate: Joi.date().iso().required().messages({
    'date.base': '"Data final" deve ser uma data válida',
    'date.iso': '"Data final" deve estar no formato ISO 8601',
    'any.required': '"Data final" é um campo obrigatório'
  }),
  tasks: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      completed: Joi.boolean()
    })
  ),
  userId: Joi.string().required()
})
  .required()
  .unknown(false)
  .error(errors => {
    // Custom error messages for unknown fields (fields that are not in the schema)
    for (const error of errors) {
      if (error.code === 'object.unknown') {
        const unknown_field = error.local.key;
        error.message = `O campo desconhecido "${unknown_field}" não é permitido.`;
      }
    }
    return errors;
  });
