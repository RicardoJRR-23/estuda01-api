const Joi = require('joi');

module.exports = Joi.object({
  name: Joi
    .string()
    .required()
    .messages({
    'string.base': 'Campo "name" deve ser do tipo String.',
    'any.required': 'Campo "name" está em falta.'
  }),
  email: Joi
    .string()
    .email()
    .required()
    .messages({
      'string.base': 'Campo "email" deve ser do tipo String.',
      'string.email': 'O email providenciado não é valido',
      'any.required': 'Campo "email" está em falta.',
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