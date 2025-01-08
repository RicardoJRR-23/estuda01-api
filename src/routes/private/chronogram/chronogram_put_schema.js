const Joi = require('joi');

/**
 * @description
 *  Schema to validate the request body when creating a cronogram
 *  based on the model in 'src/models/Cronograma/index.js'
 */

module.exports = Joi.object({
  title: Joi.string().required().messages({
    'string.base': 'Campo "title" deve ser do tipo String.',
    'any.required': 'Campo "title" está em falta.'
  }),
  description: Joi.string().allow(null, ''),
  startDate: Joi.date().iso().required().messages({
    'date.base':
      'Campo "startDate" deve ser uma data válida, exemplo: (1999-12-31)',
    'date.iso': 'Campo "startDate" deve estar no formato ISO 8601',
    'any.required': 'Campo "startDate" está em falta.'
  }),
  endDate: Joi.date().iso().required().greater(Joi.ref('startDate')).messages({
    'date.greater': 'A data final deve ser maior que a data inicial.',
    'date.base':
      'Campo "endDate" deve ser uma data válida, exemplo: (1999-12-31)',
    'date.iso': 'Campo "endDate" deve estar no formato ISO 8601',
    'any.required': 'Campo "endDate" está em falta.'
  }),
  tasks: Joi.array()
    .min(0)
    .items(
      Joi.object({
        name: Joi.string(),
        completed: Joi.boolean()
      })
    )
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
