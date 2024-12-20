const Joi = require('joi');
const { USER_ROLES } = require('../../../utils/constants');

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
    }),
  password: Joi
    .string()
    .min(6)
    .required()
    .messages({
      'string.base': 'Campo "password" deve ser do tipo String.',
      'string.min': 'O password deve conter no mínimo 6 caractéres.',
      'any.required': 'Campo "password" está em falta.',
    }),
  role: Joi
    .string()
    .valid(...Object.values(USER_ROLES))
    .optional()
    .messages({
      'string.base': 'Campo "role" deve ser do tipo String.',
      'any.only': `O valor do campo "role" deve ser uma das strings ${Object.values(USER_ROLES).map(item => `"${item}"`).join(' ou ')}.`,
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