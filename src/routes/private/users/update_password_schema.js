const Joi = require('joi');

module.exports = Joi.object({
  currentPassword: Joi
    .string()
    .required()
    .messages({
    'string.base': 'Campo "currentPassword" deve ser do tipo String.',
    'any.required': 'Campo "currentPassword" está em falta.'
  }),
  password: Joi
    .string()
    .min(6)
    .required()
    .messages({
      'string.base': 'Campo "password" deve ser do tipo String.',
      'string.min': 'O password providenciado deve ter no minimo 6 caracteres.',
      'any.required': 'Campo "password" está em falta.',
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