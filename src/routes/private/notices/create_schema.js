const Joi = require('joi');

module.exports = Joi.object({
  title: Joi
    .string()
    .required()
    .messages({
      'string.base': 'Campo "title" deve ser do tipo String.',
      'any.required': 'Campo "title" está em falta.'
    }),
  description: Joi
    .string()
    .required()
    .messages({
      'string.base': 'Campo "description" deve ser do tipo String.',
      'any.required': 'Campo "description" está em falta.',
    }),
  datePublished: Joi
    .string()
    .isoDate()
    .optional()
    .messages({
      'string.base': 'Campo "datePublished" deve ser do tipo String.',
      'string.isoDate': 'O valor do campo "datePublished" deve estar no formato AAA-MM-DD'
    }),
  link: Joi
    .string()
    .uri()
    .required()
    .messages({
      'string.base': 'Campo "link" deve ser do tipo String.',
      'string.uri': 'Campo "link" deve ser um link válido.',
      'any.required': 'Campo "link" está em falta.'
    })
  })
  .required()
  .unknown(false)
  .error((errors) => {
    for (const error of errors) {
      if (error.code === 'object.unknown') {
        const unknown_field = error.local.key;
        error.message = `O campo desconhecido "${unknown_field}" não é permitido.`;
      }
    }
    return errors;
  });